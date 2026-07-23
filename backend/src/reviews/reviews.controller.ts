import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { FastifyRequest } from 'fastify';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { ListAdminReviewsQueryDto } from './dto/list-admin-reviews-query.dto';
import { ListProductReviewsQueryDto } from './dto/list-product-reviews-query.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { DeleteReviewDto } from './dto/delete-review.dto';
import { ReviewsService } from './reviews.service';

type MultipartPart = {
  type: 'file' | 'field';
  fieldname: string;
  filename?: string;
  mimetype?: string;
  value?: unknown;
  toBuffer?: () => Promise<Buffer>;
};
type MultipartRequest = FastifyRequest & { parts: () => AsyncIterable<MultipartPart> };

async function reviewMultipart(request: MultipartRequest) {
  const fields: Record<string, string> = {};
  const files: Array<{ buffer: Buffer; filename: string; mimetype: string }> = [];
  for await (const part of request.parts()) {
    if (part.type === 'field') fields[part.fieldname] = String(part.value ?? '');
    if (part.type === 'file' && part.toBuffer && part.filename && part.mimetype) {
      files.push({ buffer: await part.toBuffer(), filename: part.filename, mimetype: part.mimetype });
    }
  }
  return { fields, files };
}

@Controller('products')
export class PublicReviewsController {
  constructor(@Inject(ReviewsService) private readonly reviews: ReviewsService) {}

  @Get(':identifier/reviews')
  async list(@Param('identifier') identifier: string, @Query() query: ListProductReviewsQueryDto) {
    const result = await this.reviews.getPublicReviews(identifier, query);
    return { success: true, ...result };
  }
}

@Controller()
@UseGuards(JwtAuthGuard)
export class CustomerReviewsController {
  constructor(@Inject(ReviewsService) private readonly reviews: ReviewsService) {}

  @Get('orders/:orderId/review-eligibility')
  async eligibility(@Param('orderId') orderId: string, @Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.reviews.getOrderReviewEligibility(orderId, request.user?.id ?? '') };
  }

  @Post('orders/:orderId/items/:orderItemId/review')
  async create(
    @Param('orderId') orderId: string,
    @Param('orderItemId') orderItemId: string,
    @Req() request: MultipartRequest & AuthenticatedRequest,
  ) {
    const { fields, files } = await reviewMultipart(request);
    return { success: true, data: await this.reviews.createOrUpdateFromOrderItem(orderId, orderItemId, request.user?.id ?? '', fields, files) };
  }

  @Patch('reviews/:reviewId')
  async update(@Param('reviewId') reviewId: string, @Req() request: MultipartRequest & AuthenticatedRequest) {
    const { fields, files } = await reviewMultipart(request);
    return { success: true, data: await this.reviews.updateReview(reviewId, request.user?.id ?? '', fields, files) };
  }

  @Delete('reviews/:reviewId')
  async remove(@Param('reviewId') reviewId: string, @Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.reviews.deleteReview(reviewId, request.user?.id ?? '') };
  }

  @Post('reviews/:reviewId/restore')
  async restore(@Param('reviewId') reviewId: string, @Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.reviews.restoreReview(reviewId, request.user?.id ?? '') };
  }

  @Delete('reviews/:reviewId/images/:imageId')
  async removeImage(@Param('reviewId') reviewId: string, @Param('imageId') imageId: string, @Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.reviews.removeReviewImage(reviewId, imageId, request.user?.id ?? '') };
  }
}

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminReviewsController {
  constructor(@Inject(ReviewsService) private readonly reviews: ReviewsService) {}

  @Get()
  async list(@Query() query: ListAdminReviewsQueryDto) {
    const result = await this.reviews.listAdminReviews(query);
    return { success: true, ...result };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return { success: true, data: await this.reviews.getAdminReview(id) };
  }

  @Patch(':id/moderation')
  async moderate(@Param('id') id: string, @Body() dto: ModerateReviewDto, @Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.reviews.moderateReview(id, request.user?.id ?? '', dto.status, dto.reason) };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Body() dto: DeleteReviewDto, @Req() request: AuthenticatedRequest) {
    return { success: true, data: await this.reviews.adminDeleteReview(id, request.user?.id ?? '', dto.reason) };
  }
}
