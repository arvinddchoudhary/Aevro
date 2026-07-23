import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  Prisma,
  ProductReviewFitFeedback,
  ProductReviewStatus,
  ProductStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UploadsService } from '../uploads/uploads.service';
import { ListAdminReviewsQueryDto } from './dto/list-admin-reviews-query.dto';
import {
  ListProductReviewsQueryDto,
  ProductReviewSort,
} from './dto/list-product-reviews-query.dto';

type ReviewFile = { buffer: Buffer; filename: string; mimetype: string };
type ReviewInput = {
  rating?: unknown;
  title?: unknown;
  body?: unknown;
  fitFeedback?: unknown;
};

const MAX_REVIEW_IMAGES = 4;
const REVIEW_WRITE_WINDOW_MS = 60 * 60 * 1000;
const MAX_REVIEW_WRITES_PER_WINDOW = 10;

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private readonly writeBuckets = new Map<string, { count: number; resetAt: number }>();

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(UploadsService) private readonly uploads: UploadsService,
  ) {}

  async getOrderReviewEligibility(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      select: {
        id: true,
        status: true,
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            productSlug: true,
            selectedSize: true,
            selectedColor: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found.');

    const productIds = order.items.flatMap((item) => (item.productId ? [item.productId] : []));
    const reviews = productIds.length
      ? await this.prisma.productReview.findMany({
          where: { userId, productId: { in: productIds } },
          include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
        })
      : [];
    const byProductId = new Map(reviews.map((review) => [review.productId, review]));

    return {
      orderStatus: order.status,
      items: order.items.map((item) => {
        const review = item.productId ? byProductId.get(item.productId) : undefined;
        const eligible = order.status === OrderStatus.DELIVERED && Boolean(item.productId);
        return {
          orderItemId: item.id,
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          eligible,
          ineligibilityReason: eligible
            ? null
            : order.status !== OrderStatus.DELIVERED
              ? 'Reviews are available after delivery.'
              : 'This product is no longer available for review.',
          review: review ? this.serializeCustomerReview(review) : null,
        };
      }),
    };
  }

  async createOrUpdateFromOrderItem(
    orderId: string,
    orderItemId: string,
    userId: string,
    input: ReviewInput,
    files: ReviewFile[],
  ) {
    this.assertWithinWriteLimit(userId);
    const parsed = this.parseReviewInput(input);
    const item = await this.requireDeliveredOwnedOrderItem(orderId, orderItemId, userId);
    const existing = await this.prisma.productReview.findUnique({
      where: { userId_productId: { userId, productId: item.productId } },
      include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
    });

    if (existing) {
      return this.updateOwnedReview(existing.id, userId, parsed, files);
    }

    this.assertImageCount(files.length);
    let review: { id: string };
    try {
      review = await this.prisma.productReview.create({
        data: {
          userId,
          productId: item.productId,
          orderId,
          orderItemId,
          rating: parsed.rating,
          title: parsed.title,
          body: parsed.body,
          fitFeedback: parsed.fitFeedback,
          purchasedSize: item.selectedSize,
          purchasedColor: item.selectedColor,
          verifiedPurchase: true,
          status: ProductReviewStatus.PENDING,
        },
      });
    } catch (error) {
      if (!this.isUniqueConstraint(error)) throw error;
      const concurrentReview = await this.prisma.productReview.findUnique({
        where: { userId_productId: { userId, productId: item.productId } },
        include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
      });
      if (!concurrentReview) throw error;
      return this.serializeCustomerReview(concurrentReview);
    }

    try {
      const images = await this.uploadAndPersistImages(review.id, files, 0);
      return this.getCustomerReview(review.id, userId, images);
    } catch (error) {
      await this.prisma.productReview.delete({ where: { id: review.id } }).catch(() => undefined);
      throw error;
    }
  }

  async updateReview(reviewId: string, userId: string, input: ReviewInput, files: ReviewFile[]) {
    this.assertWithinWriteLimit(userId);
    return this.updateOwnedReview(reviewId, userId, this.parseReviewInput(input), files);
  }

  async deleteReview(reviewId: string, userId: string) {
    const review = await this.requireOwnedReview(reviewId, userId);
    if (review.deletedAt) return this.serializeCustomerReview(review);

    const updated = await this.prisma.productReview.update({
      where: { id: review.id },
      data: {
        deletedAt: new Date(),
        moderationEvents: {
          create: {
            previousStatus: review.status,
            newStatus: review.status,
            reason: 'Customer deleted review.',
          },
        },
      },
      include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
    });
    return this.serializeCustomerReview(updated);
  }

  async restoreReview(reviewId: string, userId: string) {
    const review = await this.requireOwnedReview(reviewId, userId);
    const updated = await this.prisma.productReview.update({
      where: { id: review.id },
      data: {
        deletedAt: null,
        status: ProductReviewStatus.PENDING,
        moderatedById: null,
        moderatedAt: null,
        moderationReason: null,
        moderationEvents: {
          create: {
            previousStatus: review.status,
            newStatus: ProductReviewStatus.PENDING,
            reason: 'Customer restored review.',
          },
        },
      },
      include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
    });
    return this.serializeCustomerReview(updated);
  }

  async removeReviewImage(reviewId: string, imageId: string, userId: string) {
    this.assertWithinWriteLimit(userId);
    const review = await this.requireOwnedReview(reviewId, userId);
    const image = await this.prisma.productReviewImage.findFirst({
      where: { id: imageId, reviewId, deletedAt: null },
    });
    if (!image) throw new NotFoundException('Review image not found.');

    const updated = await this.prisma.productReview.update({
      where: { id: review.id },
      data: {
        status: ProductReviewStatus.PENDING,
        moderatedById: null,
        moderatedAt: null,
        moderationReason: null,
        images: { update: { where: { id: image.id }, data: { deletedAt: new Date() } } },
        moderationEvents: {
          create: {
            previousStatus: review.status,
            newStatus: ProductReviewStatus.PENDING,
            reason: 'Customer changed review images.',
          },
        },
      },
      include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
    });
    void this.uploads.deleteImage(image.publicId);
    return this.serializeCustomerReview(updated);
  }

  async getPublicReviews(identifier: string, query: ListProductReviewsQueryDto) {
    const product = await this.prisma.product.findFirst({
      where: { status: ProductStatus.ACTIVE, OR: [{ id: identifier }, { slug: identifier }] },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found.');

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 6);
    const where: Prisma.ProductReviewWhereInput = {
      productId: product.id,
      status: ProductReviewStatus.APPROVED,
      deletedAt: null,
    };
    const orderBy = this.publicOrderBy(query.sort ?? 'newest');
    const [reviews, reviewSummary] = await Promise.all([
      this.prisma.productReview.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true } },
          images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } },
        },
      }),
      this.prisma.productReview.findMany({
        where,
        select: { rating: true, fitFeedback: true },
      }),
    ]);

    const total = reviewSummary.length;
    const ratingBreakdown = Object.fromEntries([1, 2, 3, 4, 5].map((rating) => [
      rating,
      reviewSummary.filter((review) => review.rating === rating).length,
    ]));
    const fitBreakdown = Object.fromEntries(
      Object.values(ProductReviewFitFeedback).map((fit) => [
        fit,
        reviewSummary.filter((review) => review.fitFeedback === fit).length,
      ]),
    );
    const averageRating = total === 0
      ? null
      : Number((reviewSummary.reduce((sum, review) => sum + review.rating, 0) / total).toFixed(1));

    return {
      summary: {
        averageRating,
        reviewCount: total,
        ratingBreakdown,
        fitBreakdown,
      },
      data: reviews.map((review) => this.serializePublicReview(review)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async listAdminReviews(query: ListAdminReviewsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ProductReviewWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.rating ? { rating: query.rating } : {}),
      ...((query.from || query.to) ? { createdAt: { ...(query.from ? { gte: new Date(query.from) } : {}), ...(query.to ? { lte: new Date(query.to) } : {}) } } : {}),
    };
    const [reviews, total] = await Promise.all([
      this.prisma.productReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: this.adminReviewInclude(),
      }),
      this.prisma.productReview.count({ where }),
    ]);
    return {
      data: reviews.map((review) => this.serializeAdminReview(review)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 },
    };
  }

  async getAdminReview(id: string) {
    const review = await this.prisma.productReview.findUnique({ where: { id }, include: this.adminReviewInclude() });
    if (!review) throw new NotFoundException('Review not found.');
    return this.serializeAdminReview(review);
  }

  async moderateReview(
    id: string,
    adminId: string,
    status: ProductReviewStatus,
    reason?: string,
  ) {
    if (status !== ProductReviewStatus.APPROVED && status !== ProductReviewStatus.REJECTED && status !== ProductReviewStatus.HIDDEN) {
      throw new BadRequestException('Invalid review moderation status.');
    }
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found.');
    if ((status === ProductReviewStatus.REJECTED || status === ProductReviewStatus.HIDDEN) && !reason?.trim()) {
      throw new BadRequestException('A moderation reason is required.');
    }
    const updated = await this.prisma.productReview.update({
      where: { id },
      data: {
        status,
        deletedAt: null,
        moderatedById: adminId,
        moderatedAt: new Date(),
        moderationReason: reason?.trim() || null,
        moderationEvents: { create: { moderatorId: adminId, previousStatus: review.status, newStatus: status, reason: reason?.trim() || null } },
      },
      include: this.adminReviewInclude(),
    });
    return this.serializeAdminReview(updated);
  }

  async adminDeleteReview(id: string, adminId: string, reason: string) {
    if (!reason?.trim()) throw new BadRequestException('A moderation reason is required.');
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found.');
    const updated = await this.prisma.productReview.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        moderatedById: adminId,
        moderatedAt: new Date(),
        moderationReason: reason.trim(),
        moderationEvents: { create: { moderatorId: adminId, previousStatus: review.status, newStatus: review.status, reason: reason.trim() } },
      },
      include: this.adminReviewInclude(),
    });
    return this.serializeAdminReview(updated);
  }

  private async updateOwnedReview(reviewId: string, userId: string, parsed: ReturnType<ReviewsService['parseReviewInput']>, files: ReviewFile[]) {
    const review = await this.requireOwnedReview(reviewId, userId);
    this.assertImageCount(review.images.length + files.length);
    const uploaded = await this.uploads.uploadReviewImages({ files, reviewId: review.id });
    try {
      const updated = await this.prisma.productReview.update({
        where: { id: review.id },
        data: {
          rating: parsed.rating,
          title: parsed.title,
          body: parsed.body,
          fitFeedback: parsed.fitFeedback,
          deletedAt: null,
          status: ProductReviewStatus.PENDING,
          moderatedById: null,
          moderatedAt: null,
          moderationReason: null,
          images: uploaded.length ? { create: uploaded.map((image, index) => ({ ...image, sortOrder: review.images.length + index })) } : undefined,
          moderationEvents: { create: { previousStatus: review.status, newStatus: ProductReviewStatus.PENDING, reason: 'Customer edited review.' } },
        },
        include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
      });
      return this.serializeCustomerReview(updated);
    } catch (error) {
      await Promise.all(uploaded.map((image) => this.uploads.deleteImage(image.publicId)));
      throw error;
    }
  }

  private async uploadAndPersistImages(reviewId: string, files: ReviewFile[], existingCount: number) {
    const uploaded = await this.uploads.uploadReviewImages({ files, reviewId });
    try {
      if (uploaded.length) {
        await this.prisma.productReview.update({
          where: { id: reviewId },
          data: { images: { create: uploaded.map((image, index) => ({ ...image, sortOrder: existingCount + index })) } },
        });
      }
      return uploaded;
    } catch (error) {
      await Promise.all(uploaded.map((image) => this.uploads.deleteImage(image.publicId)));
      throw error;
    }
  }

  private async getCustomerReview(id: string, userId: string, _uploaded: unknown) {
    const review = await this.prisma.productReview.findFirst({ where: { id, userId }, include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } } });
    if (!review) throw new NotFoundException('Review not found.');
    return this.serializeCustomerReview(review);
  }

  private async requireDeliveredOwnedOrderItem(orderId: string, orderItemId: string, userId: string) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: orderItemId, orderId, order: { userId, status: OrderStatus.DELIVERED }, productId: { not: null } },
      select: { productId: true, selectedSize: true, selectedColor: true },
    });
    if (!item?.productId) throw new ForbiddenException('Only delivered items from your account can be reviewed.');
    return { ...item, productId: item.productId };
  }

  private async requireOwnedReview(id: string, userId: string) {
    const review = await this.prisma.productReview.findFirst({
      where: { id, userId },
      include: { images: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
    });
    if (!review) throw new NotFoundException('Review not found.');
    return review;
  }

  private parseReviewInput(input: ReviewInput) {
    const rating = Number(input.rating);
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    const body = typeof input.body === 'string' ? input.body.trim() : '';
    const fitFeedback = typeof input.fitFeedback === 'string' && input.fitFeedback.trim() ? input.fitFeedback.trim() : null;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BadRequestException('Rating must be an integer between 1 and 5.');
    if (title.length > 100) throw new BadRequestException('Review title must be 100 characters or fewer.');
    if (body.length < 10 || body.length > 2000) throw new BadRequestException('Review text must be between 10 and 2000 characters.');
    if (fitFeedback && !Object.values(ProductReviewFitFeedback).includes(fitFeedback as ProductReviewFitFeedback)) {
      throw new BadRequestException('Invalid fit feedback.');
    }
    return { rating, title: title || null, body, fitFeedback: fitFeedback as ProductReviewFitFeedback | null };
  }

  private assertImageCount(count: number) {
    if (count > MAX_REVIEW_IMAGES) throw new BadRequestException('A review can have up to 4 images.');
  }

  private assertWithinWriteLimit(userId: string) {
    const now = Date.now();
    const current = this.writeBuckets.get(userId);
    if (!current || current.resetAt <= now) {
      this.writeBuckets.set(userId, { count: 1, resetAt: now + REVIEW_WRITE_WINDOW_MS });
      return;
    }
    if (current.count >= MAX_REVIEW_WRITES_PER_WINDOW) throw new ForbiddenException('Too many review updates. Please try again later.');
    current.count += 1;
  }

  private isUniqueConstraint(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
      || Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'P2002');
  }

  private publicOrderBy(sort: ProductReviewSort): Prisma.ProductReviewOrderByWithRelationInput[] {
    if (sort === 'highest') return [{ rating: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'lowest') return [{ rating: 'asc' }, { createdAt: 'desc' }];
    return [{ createdAt: 'desc' }];
  }

  private adminReviewInclude() {
    return {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true, slug: true } },
      order: { select: { id: true, orderNumber: true } },
      images: { orderBy: { sortOrder: 'asc' as const } },
      moderationEvents: { orderBy: { createdAt: 'desc' as const }, include: { moderator: { select: { id: true, name: true } } } },
    } satisfies Prisma.ProductReviewInclude;
  }

  private serializeCustomerReview(review: any) {
    return { id: review.id, rating: review.rating, title: review.title, body: review.body, fitFeedback: review.fitFeedback, purchasedSize: review.purchasedSize, purchasedColor: review.purchasedColor, verifiedPurchase: review.verifiedPurchase, status: review.status, moderationReason: review.moderationReason, deletedAt: review.deletedAt, images: review.images.map((image: any) => ({ id: image.id, url: image.url, sortOrder: image.sortOrder })), updatedAt: review.updatedAt };
  }

  private serializePublicReview(review: any) {
    return { id: review.id, rating: review.rating, title: review.title, body: review.body, fitFeedback: review.fitFeedback, purchasedSize: review.purchasedSize, purchasedColor: review.purchasedColor, verifiedPurchase: true, reviewerName: this.publicName(review.user.name), createdAt: review.createdAt, images: review.images.map((image: any) => ({ id: image.id, url: image.url, sortOrder: image.sortOrder })) };
  }

  private serializeAdminReview(review: any) {
    return { ...this.serializeCustomerReview(review), product: review.product, order: review.order, customer: review.user, moderatedById: review.moderatedById, moderatedAt: review.moderatedAt, moderationReason: review.moderationReason, moderationEvents: review.moderationEvents };
  }

  private publicName(name: string | null | undefined) {
    const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0] ?? 'Verified customer';
  }
}
