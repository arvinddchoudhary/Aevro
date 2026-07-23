import assert from 'node:assert/strict';
import test from 'node:test';
import { OrderStatus, ProductReviewStatus } from '@prisma/client';
import { ReviewsService } from './reviews.service';

function createService(prisma: Record<string, unknown> = {}) {
  return new ReviewsService(prisma as never, {
    uploadReviewImages: async () => [],
    deleteImage: async () => true,
  } as never);
}

test('requires a delivered owned order item before a customer can create a review', async () => {
  const service = createService({
    orderItem: { findFirst: async () => null },
  });
  await assert.rejects(
    service.createOrUpdateFromOrderItem('order', 'item', 'user', { rating: 5, body: 'A detailed and useful review.' }, []),
    /Only delivered items/,
  );
});

test('validates ratings and meaningful review content', () => {
  const service = createService();
  assert.throws(() => (service as any).parseReviewInput({ rating: 0, body: 'A detailed and useful review.' }), /Rating/);
  assert.throws(() => (service as any).parseReviewInput({ rating: 5, body: 'short' }), /Review text/);
  assert.throws(() => (service as any).parseReviewInput({ rating: 5, title: 'x'.repeat(101), body: 'A detailed and useful review.' }), /title/);
});

test('public review queries include only approved non-deleted reviews and return rating aggregates', async () => {
  const calls: Record<string, unknown>[] = [];
  const service = createService({
    product: { findFirst: async () => ({ id: 'product' }) },
    productReview: {
      findMany: async (args: Record<string, unknown>) => { calls.push(args); return []; },
      count: async () => 0,
      aggregate: async () => ({ _avg: { rating: null } }),
      groupBy: async () => [],
    },
  });
  const result = await service.getPublicReviews('product', { page: 1, limit: 6, sort: 'highest' });
  assert.equal(result.summary.reviewCount, 0);
  assert.deepEqual((calls[0].where as Record<string, unknown>), { productId: 'product', status: ProductReviewStatus.APPROVED, deletedAt: null });
});

test('normalizes Fastify string pagination values before passing them to Prisma', async () => {
  const calls: Record<string, unknown>[] = [];
  const service = createService({
    product: { findFirst: async () => ({ id: 'product' }) },
    productReview: {
      findMany: async (args: Record<string, unknown>) => { calls.push(args); return []; },
    },
  });

  await service.getPublicReviews('product', { page: '2' as never, limit: '6' as never, sort: 'newest' });

  assert.equal(calls[0].skip, 6);
  assert.equal(calls[0].take, 6);
  assert.equal(typeof calls[0].take, 'number');
});

test('requires a moderation reason when rejecting or hiding a review', async () => {
  const service = createService({ productReview: { findUnique: async () => ({ id: 'review', status: ProductReviewStatus.PENDING }) } });
  await assert.rejects(service.moderateReview('review', 'admin', ProductReviewStatus.REJECTED), /reason is required/);
  await assert.rejects(service.moderateReview('review', 'admin', ProductReviewStatus.HIDDEN), /reason is required/);
});

test('records a moderation event when an admin approves a review', async () => {
  let updateData: Record<string, unknown> | undefined;
  const service = createService({
    productReview: {
      findUnique: async () => ({ id: 'review', status: ProductReviewStatus.PENDING }),
      update: async ({ data }: { data: Record<string, unknown> }) => {
        updateData = data;
        return { id: 'review', rating: 5, title: null, body: 'A detailed and useful review.', fitFeedback: null, purchasedSize: '32', purchasedColor: 'Black', verifiedPurchase: true, status: ProductReviewStatus.APPROVED, moderationReason: null, deletedAt: null, images: [], product: { id: 'p', name: 'Trouser', slug: 'trouser' }, order: { id: 'o', orderNumber: 'AEVRO-1' }, user: { id: 'u', name: 'Customer', email: 'c@example.com' }, moderationEvents: [], moderatedById: 'admin', moderatedAt: new Date() };
      },
    },
  });
  await service.moderateReview('review', 'admin', ProductReviewStatus.APPROVED);
  assert.deepEqual((updateData?.moderationEvents as { create: { previousStatus: ProductReviewStatus; newStatus: ProductReviewStatus } }).create, { moderatorId: 'admin', previousStatus: ProductReviewStatus.PENDING, newStatus: ProductReviewStatus.APPROVED, reason: null });
});

test('exposes eligibility only for delivered orders', async () => {
  const service = createService({
    order: { findFirst: async () => ({ id: 'order', status: OrderStatus.CONFIRMED, items: [{ id: 'item', productId: 'product', productName: 'Trouser', productSlug: 'trouser', selectedSize: '32', selectedColor: 'Black' }] }) },
    productReview: { findMany: async () => [] },
  });
  const result = await service.getOrderReviewEligibility('order', 'user');
  assert.equal(result.items[0].eligible, false);
  assert.match(result.items[0].ineligibilityReason ?? '', /after delivery/);
});

test('rejects more than four active review images', () => {
  const service = createService();
  assert.throws(() => (service as any).assertImageCount(5), /up to 4 images/);
});

test('customer edits reset review moderation and clean up uploaded images if persistence fails', async () => {
  let cleanupCalls = 0;
  const service = new ReviewsService({
    productReview: {
      findFirst: async () => ({ id: 'review', userId: 'user', status: ProductReviewStatus.APPROVED, images: [] }),
      update: async () => { throw new Error('database write failed'); },
    },
  } as never, {
    uploadReviewImages: async () => [{ url: 'https://example.invalid/review.webp', publicId: 'review-image', sortOrder: 0 }],
    deleteImage: async () => { cleanupCalls += 1; return false; },
  } as never);

  await assert.rejects(
    service.updateReview('review', 'user', { rating: 4, body: 'A revised and useful product review.' }, [{ buffer: Buffer.from('image'), filename: 'review.webp', mimetype: 'image/webp' }]),
    /database write failed/,
  );
  assert.equal(cleanupCalls, 1);
});

test('public review sorting uses rating order when requested', async () => {
  const calls: Record<string, unknown>[] = [];
  const service = createService({
    product: { findFirst: async () => ({ id: 'product' }) },
    productReview: {
      findMany: async (args: Record<string, unknown>) => { calls.push(args); return []; },
      count: async () => 0,
      aggregate: async () => ({ _avg: { rating: null } }),
      groupBy: async () => [],
    },
  });
  await service.getPublicReviews('product', { page: 2, limit: 6, sort: 'lowest' });
  assert.deepEqual(calls[0].orderBy, [{ rating: 'asc' }, { createdAt: 'desc' }]);
  assert.equal(calls[0].skip, 6);
});

test('concurrent first submissions recover from the unique review constraint without another review row', async () => {
  const concurrentReview = {
    id: 'review', rating: 5, title: null, body: 'A detailed and useful review.', fitFeedback: null,
    purchasedSize: '32', purchasedColor: 'Black', verifiedPurchase: true, status: ProductReviewStatus.PENDING,
    moderationReason: null, deletedAt: null, images: [], updatedAt: new Date(),
  };
  let findUniqueCalls = 0;
  const service = createService({
    orderItem: { findFirst: async () => ({ productId: 'product', selectedSize: '32', selectedColor: 'Black' }) },
    productReview: {
      findUnique: async () => (++findUniqueCalls === 1 ? null : concurrentReview),
      create: async () => { throw { code: 'P2002' }; },
    },
  });
  const result = await service.createOrUpdateFromOrderItem('order', 'item', 'user', { rating: 5, body: 'A detailed and useful review.' }, []);
  assert.equal(result.id, 'review');
  assert.equal(findUniqueCalls, 2);
});

test('customer edits and image removal return an approved review to pending', async () => {
  let updateData: Record<string, any> | undefined;
  const baseReview = { id: 'review', userId: 'user', status: ProductReviewStatus.APPROVED, images: [], rating: 5, title: null, body: 'A detailed and useful review.', fitFeedback: null, purchasedSize: '32', purchasedColor: 'Black', verifiedPurchase: true, moderationReason: null, deletedAt: null, updatedAt: new Date() };
  const service = new ReviewsService({
    productReview: {
      findFirst: async () => baseReview,
      update: async ({ data }: { data: Record<string, any> }) => { updateData = data; return { ...baseReview, ...data, images: [] }; },
    },
    productReviewImage: { findFirst: async () => ({ id: 'image', reviewId: 'review', publicId: 'review-image' }) },
  } as never, { uploadReviewImages: async () => [], deleteImage: async () => true } as never);

  await service.updateReview('review', 'user', { rating: 4, body: 'A revised and useful product review.' }, []);
  assert.equal(updateData?.status, ProductReviewStatus.PENDING);
  assert.equal(updateData?.moderationReason, null);

  await service.removeReviewImage('review', 'image', 'user');
  assert.equal(updateData?.status, ProductReviewStatus.PENDING);
  assert.ok((updateData?.images as { update: unknown }).update);
});

test('customer soft deletion retains the record and restoration returns it to pending', async () => {
  const baseReview = { id: 'review', userId: 'user', status: ProductReviewStatus.APPROVED, images: [], rating: 5, title: null, body: 'A detailed and useful review.', fitFeedback: null, purchasedSize: '32', purchasedColor: 'Black', verifiedPurchase: true, moderationReason: null, deletedAt: null, updatedAt: new Date() };
  const writes: Record<string, any>[] = [];
  const service = createService({
    productReview: {
      findFirst: async () => baseReview,
      update: async ({ data }: { data: Record<string, any> }) => { writes.push(data); return { ...baseReview, ...data, images: [] }; },
    },
  });
  await service.deleteReview('review', 'user');
  await service.restoreReview('review', 'user');
  assert.ok(writes[0].deletedAt instanceof Date);
  assert.equal(writes[1].deletedAt, null);
  assert.equal(writes[1].status, ProductReviewStatus.PENDING);
});
