'use client';

import { useState } from 'react';
import type { ProductReviewsResponse, PublicProductReview } from '../../types/reviews';
import type { ProductImage } from '../../types/catalog';
import { getProductReviews } from '../../lib/api/catalog';
import { CloudinaryProductImage } from './CloudinaryProductImage';
import { ProductImageLightbox } from './ProductImageLightbox';

function Stars({ rating }: { rating: number }) {
  return <span aria-label={`${rating} out of 5 stars`} className="tracking-[0.08em]">{'★'.repeat(rating)}<span className="text-[#c7bfb4]">{'★'.repeat(5 - rating)}</span></span>;
}

function fitLabel(value: PublicProductReview['fitFeedback']) {
  return value === 'RUNS_SMALL' ? 'Runs small' : value === 'RUNS_LARGE' ? 'Runs large' : value === 'TRUE_TO_SIZE' ? 'True to size' : null;
}

export function ProductReviews({ identifier, initial }: { identifier: string; initial: ProductReviewsResponse | null }) {
  const initialResponse: ProductReviewsResponse = initial ?? {
    success: true,
    summary: {
      averageRating: null,
      reviewCount: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      fitBreakdown: { RUNS_SMALL: 0, TRUE_TO_SIZE: 0, RUNS_LARGE: 0 },
    },
    data: [],
    meta: { page: 1, limit: 6, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
  };
  const [reviews, setReviews] = useState(initialResponse.data);
  const [meta, setMeta] = useState(initialResponse.meta);
  const [sort, setSort] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [loading, setLoading] = useState(false);
  const [reviewGallery, setReviewGallery] = useState<{ images: ProductImage[]; currentIndex: number } | null>(null);

  const changeSort = async (nextSort: 'newest' | 'highest' | 'lowest') => {
    setSort(nextSort);
    setLoading(true);
    const next = await getProductReviews(identifier, { page: 1, limit: initialResponse.meta.limit, sort: nextSort });
    if (next) {
      setReviews(next.data);
      setMeta(next.meta);
    }
    setLoading(false);
  };

  const loadMore = async () => {
    if (loading || !meta.hasNextPage) return;
    setLoading(true);
    const next = await getProductReviews(identifier, { page: meta.page + 1, limit: meta.limit, sort });
    if (next) {
      setReviews((current) => [...current, ...next.data]);
      setMeta(next.meta);
    }
    setLoading(false);
  };

  if (initialResponse.summary.reviewCount === 0) {
    return (
      <section id="reviews" className="mt-8 scroll-mt-28 border border-[#e5dbcf] bg-[#fffaf3] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77716a]">Ratings &amp; reviews</p>
        <p className="mt-4 text-lg font-light">No reviews yet.</p>
        <p className="mt-2 text-sm leading-6 text-[#514c45]">Verified customers can share their experience after their order is delivered.</p>
      </section>
    );
  }

  return (
    <section id="reviews" className="mt-8 scroll-mt-28 border border-[#e5dbcf] bg-[#fffaf3] p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[190px_260px_minmax(0,1fr)] lg:gap-8">
        <aside className="lg:border-r lg:border-[#e5dbcf] lg:pr-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#77716a]">Customer reviews</p>
          <p className="mt-5 text-4xl font-light">{initialResponse.summary.averageRating?.toFixed(1)}</p>
          <p className="mt-2 text-sm text-[#514c45]">{initialResponse.summary.reviewCount} verified purchase review{initialResponse.summary.reviewCount === 1 ? '' : 's'}</p>
        </aside>
        <div className="border-y border-[#e5dbcf] py-6 lg:border-y-0 lg:border-r lg:py-0 lg:pr-8">
          <div className="space-y-2 text-xs text-[#514c45]">
            {[5, 4, 3, 2, 1].map((rating) => <div key={rating} className="grid grid-cols-[20px_1fr_28px] items-center gap-2"><span>{rating}</span><span className="h-1.5 bg-[#e9e1d7]"><span className="block h-full bg-[#111111]" style={{ width: `${initialResponse.summary.reviewCount ? ((initialResponse.summary.ratingBreakdown[rating] ?? 0) / initialResponse.summary.reviewCount) * 100 : 0}%` }} /></span><span>{initialResponse.summary.ratingBreakdown[rating] ?? 0}</span></div>)}
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-[#e5dbcf] pb-4">
            <p className="text-sm text-[#514c45]">Verified customer feedback</p>
            <label className="text-xs text-[#514c45]">Sort
              <select value={sort} onChange={(event) => void changeSort(event.target.value as 'newest' | 'highest' | 'lowest')} disabled={loading} className="ml-2 h-9 border border-[#ddd4c8] bg-[#fffaf3] px-2 text-xs">
                <option value="newest">Newest</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </label>
          </div>
          {reviews.map((review) => {
            const reviewImages: ProductImage[] = review.images.map((image) => ({
              id: image.id,
              url: image.url,
              altText: 'Customer review photo',
              sortOrder: image.sortOrder,
            }));

            return <article key={review.id} className="border-b border-[#e5dbcf] pb-6 last:border-b-0"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium">{review.reviewerName} <span className="ml-2 text-xs font-normal text-[#77716a]">Verified purchase</span></p><p className="mt-1 text-sm text-[#111111]"><Stars rating={review.rating} /></p></div><p className="text-xs text-[#77716a]">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p></div>{review.title ? <h3 className="mt-4 text-base font-medium">{review.title}</h3> : null}<p className="mt-2 text-sm leading-6 text-[#514c45]">{review.body}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-[#77716a]">{review.purchasedSize ? <span>Size {review.purchasedSize}</span> : null}{review.purchasedColor ? <span>· {review.purchasedColor}</span> : null}{fitLabel(review.fitFeedback) ? <span>· {fitLabel(review.fitFeedback)}</span> : null}</div>{reviewImages.length ? <div className="mt-4 grid grid-cols-4 gap-2">{reviewImages.map((image, imageIndex) => <button key={image.id} type="button" onClick={() => setReviewGallery({ images: reviewImages, currentIndex: imageIndex })} className="relative aspect-square overflow-hidden bg-[#eee8de] text-left transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2" aria-label={`Open customer review photo ${imageIndex + 1} of ${reviewImages.length}`}><CloudinaryProductImage src={image.url} alt="Customer review photo" delivery="thumbnail" sizes="(max-width: 640px) 22vw, 120px" className="object-cover" loading="lazy" /></button>)}</div> : null}</article>;
          })}
          {meta.hasNextPage ? <button type="button" onClick={loadMore} disabled={loading} className="h-11 border border-[#111111] px-5 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50">{loading ? 'Loading' : 'Load more reviews'}</button> : null}
        </div>
      </div>
      <ProductImageLightbox
        images={reviewGallery?.images ?? []}
        currentIndex={reviewGallery?.currentIndex ?? 0}
        productName="Customer review"
        isOpen={Boolean(reviewGallery)}
        onClose={() => setReviewGallery(null)}
        onPrevious={() => setReviewGallery((current) => current ? { ...current, currentIndex: Math.max(0, current.currentIndex - 1) } : current)}
        onNext={() => setReviewGallery((current) => current ? { ...current, currentIndex: Math.min(current.images.length - 1, current.currentIndex + 1) } : current)}
      />
    </section>
  );
}
