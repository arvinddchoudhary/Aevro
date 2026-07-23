import { authenticatedFetch } from './authenticated-request';
import type { CustomerReview, OrderReviewEligibility } from '../../types/reviews';

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string | string[] };
    throw new Error(Array.isArray(body.message) ? body.message.join(' ') : body.message ?? 'Review request failed.');
  }
  const body = await response.json() as { success?: boolean; data?: T; message?: string };
  if (!body.success || !body.data) throw new Error(body.message ?? 'Review request failed.');
  return body.data;
}

export async function getOrderReviewEligibility(orderId: string) {
  return parse<OrderReviewEligibility>(await authenticatedFetch(`/orders/${encodeURIComponent(orderId)}/review-eligibility`, { cache: 'no-store' }));
}

function reviewForm(values: { rating: number; title?: string; body: string; fitFeedback?: string }, files: File[]) {
  const form = new FormData();
  form.set('rating', String(values.rating));
  form.set('title', values.title ?? '');
  form.set('body', values.body);
  form.set('fitFeedback', values.fitFeedback ?? '');
  files.forEach((file) => form.append('images', file));
  return form;
}

export async function submitOrderItemReview(orderId: string, orderItemId: string, values: { rating: number; title?: string; body: string; fitFeedback?: string }, files: File[]) {
  return parse<CustomerReview>(await authenticatedFetch(`/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(orderItemId)}/review`, { method: 'POST', body: reviewForm(values, files) }));
}

export async function updateReview(reviewId: string, values: { rating: number; title?: string; body: string; fitFeedback?: string }, files: File[]) {
  return parse<CustomerReview>(await authenticatedFetch(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'PATCH', body: reviewForm(values, files) }));
}

export async function deleteReview(reviewId: string) { return parse<CustomerReview>(await authenticatedFetch(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' })); }
export async function restoreReview(reviewId: string) { return parse<CustomerReview>(await authenticatedFetch(`/reviews/${encodeURIComponent(reviewId)}/restore`, { method: 'POST' })); }
export async function deleteReviewImage(reviewId: string, imageId: string) { return parse<CustomerReview>(await authenticatedFetch(`/reviews/${encodeURIComponent(reviewId)}/images/${encodeURIComponent(imageId)}`, { method: 'DELETE' })); }
