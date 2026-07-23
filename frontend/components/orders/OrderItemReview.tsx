'use client';

import { useState } from 'react';
import { deleteReview, deleteReviewImage, restoreReview, submitOrderItemReview, updateReview } from '../../lib/api/reviews';
import type { CustomerReview, OrderReviewEligibility } from '../../types/reviews';
import { CloudinaryProductImage } from '../products/CloudinaryProductImage';

export function OrderItemReview({ orderId, item }: { orderId: string; item: OrderReviewEligibility['items'][number] }) {
  const [review, setReview] = useState<CustomerReview | null>(item.review);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(item.review?.rating ?? 5);
  const [title, setTitle] = useState(item.review?.title ?? '');
  const [body, setBody] = useState(item.review?.body ?? '');
  const [fitFeedback, setFitFeedback] = useState(item.review?.fitFeedback ?? '');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!item.eligible && !review) return <p className="mt-3 text-xs text-[#77716a]">{item.ineligibilityReason}</p>;

  const save = async () => {
    try {
      setSaving(true);
      setError('');
      const values = { rating, title, body, fitFeedback: fitFeedback || undefined };
      const updated = review
        ? await updateReview(review.id, values, files)
        : await submitOrderItemReview(orderId, item.orderItemId, values, files);
      setReview(updated);
      setFiles([]);
      setOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save review.');
    } finally {
      setSaving(false);
    }
  };

  const selectFiles = (nextFiles: File[]) => {
    if (nextFiles.some((file) => file.size > 5 * 1024 * 1024)) {
      setError('Each review image must be 5 MB or smaller.');
      return;
    }
    setError('');
    setFiles(nextFiles.slice(0, 4));
  };

  const removeImage = async (imageId: string) => {
    if (!review) return;
    try {
      setError('');
      setReview(await deleteReviewImage(review.id, imageId));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Unable to remove review image.');
    }
  };

  const reviewStatusMessage = review?.deletedAt
    ? 'This review is removed from public view. You can restore it whenever you are ready.'
    : review?.status === 'PENDING'
      ? 'Your review is being checked and will appear on the product page once approved.'
      : review?.status === 'REJECTED'
        ? 'This review could not be published. You can update it and submit it again.'
        : review?.status === 'HIDDEN'
          ? 'This review is currently not visible publicly. You can update it and submit it again.'
          : review?.status === 'APPROVED'
            ? 'Your review is live on the product page. Thank you for sharing your experience.'
            : null;

  return (
    <div className="mt-4 border-t border-[#e7ded2] pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setOpen((value) => !value)} className="text-xs font-semibold uppercase tracking-[0.1em] underline underline-offset-4">
          {review ? 'Edit review' : 'Write a review'}
        </button>
        {review ? <span className="text-xs text-[#77716a]">Status: {review.deletedAt ? 'DELETED' : review.status}</span> : null}
        {review?.deletedAt ? <button type="button" onClick={() => void restoreReview(review.id).then(setReview).catch((value: Error) => setError(value.message))} className="text-xs underline">Restore</button> : null}
        {review && !review.deletedAt ? <button type="button" onClick={() => void deleteReview(review.id).then(setReview).catch((value: Error) => setError(value.message))} className="text-xs underline">Delete</button> : null}
      </div>
      {reviewStatusMessage ? <p className="mt-2 text-xs leading-5 text-[#77716a]">{reviewStatusMessage}</p> : null}
      {review?.moderationReason ? <p className="mt-2 text-xs text-[#8a1f1f]">{review.moderationReason}</p> : null}
      {review && !review.deletedAt && review.images.length ? <div className="mt-3 flex flex-wrap gap-2">{review.images.map((image) => <div key={image.id} className="flex items-center gap-2 border border-[#ddd4c8] p-1"><div className="relative h-10 w-10 overflow-hidden bg-[#eee8de]"><CloudinaryProductImage src={image.url} alt="Your review photo" delivery="thumbnail" sizes="40px" className="object-cover" loading="lazy" /></div><button type="button" onClick={() => void removeImage(image.id)} className="text-xs underline">Remove</button></div>)}</div> : null}
      {open ? <div className="mt-4 grid gap-3 border border-[#ddd4c8] p-4">
        <label className="text-xs uppercase tracking-[0.12em]">Rating<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="mt-2 block h-10 w-full border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label>
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} placeholder="Review title (optional)" className="h-10 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} minLength={10} maxLength={2000} placeholder="Share your experience (10–2000 characters)" className="min-h-24 border border-[#ddd4c8] bg-[#fffaf3] p-3 text-sm" />
        <select value={fitFeedback} onChange={(event) => setFitFeedback(event.target.value)} className="h-10 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm"><option value="">Fit feedback (optional)</option><option value="RUNS_SMALL">Runs small</option><option value="TRUE_TO_SIZE">True to size</option><option value="RUNS_LARGE">Runs large</option></select>
        <div className="border border-dashed border-[#cfc3b5] bg-[#fffaf3] p-3">
          <input id={`review-images-${item.orderItemId}`} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => selectFiles(Array.from(event.target.files ?? []))} className="sr-only" />
          <label htmlFor={`review-images-${item.orderItemId}`} className="inline-flex h-10 cursor-pointer items-center border border-[#111111] px-4 text-xs font-semibold uppercase tracking-[0.1em] transition hover:bg-[#111111] hover:text-[#fffaf3]">Add review photos</label>
          <p className="mt-2 text-xs leading-5 text-[#77716a]">Optional — upload up to 4 JPEG, PNG, or WebP photos (5 MB each).</p>
          {files.length ? <p className="mt-1 text-xs font-medium text-[#2f2a25]">{files.length} new photo{files.length === 1 ? '' : 's'} selected</p> : null}
        </div>
        {error ? <p className="text-xs text-[#8a1f1f]">{error}</p> : null}
        <button type="button" onClick={() => void save()} disabled={saving} className="h-10 bg-[#111111] px-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#fffaf3] disabled:opacity-50">{saving ? 'Saving' : 'Submit for review'}</button>
      </div> : null}
    </div>
  );
}
