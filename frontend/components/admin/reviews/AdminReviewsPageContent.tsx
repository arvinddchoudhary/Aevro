'use client';

import { useEffect, useState } from 'react';
import { deleteAdminReview, getAdminReviews, moderateAdminReview } from '../../../lib/api/admin-reviews';
import { CloudinaryProductImage } from '../../products/CloudinaryProductImage';

export function AdminReviewsPageContent() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [productId, setProductId] = useState('');
  const [rating, setRating] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const result = await getAdminReviews({ status, productId, rating, from, to });
      setReviews(result.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load reviews.');
    }
  };

  useEffect(() => { void load(); }, [status, productId, rating, from, to]);

  const moderate = async (id: string, next: 'APPROVED' | 'REJECTED' | 'HIDDEN') => {
    const reason = next === 'APPROVED' ? '' : window.prompt('Moderation reason (required):') ?? '';
    if (next !== 'APPROVED' && !reason.trim()) return;
    try {
      await moderateAdminReview(id, next, reason || undefined);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to moderate review.');
    }
  };

  const remove = async (id: string) => {
    const reason = window.prompt('Deletion reason (required):') ?? '';
    if (!reason.trim()) return;
    try {
      await deleteAdminReview(id, reason);
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to remove review.');
    }
  };

  return <section>
    <div className="border-b border-[#ddd4c8] pb-6"><p className="text-xs uppercase tracking-[0.2em] text-[#777777]">Customer feedback</p><h1 className="mt-3 text-4xl font-light">Product reviews</h1></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm"><option value="">All statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="HIDDEN">Hidden</option></select>
      <input value={productId} onChange={(event) => setProductId(event.target.value)} placeholder="Product ID" className="h-10 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm" />
      <select value={rating} onChange={(event) => setRating(event.target.value)} className="h-10 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm"><option value="">Any rating</option>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select>
      <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-10 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm" />
      <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-10 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm" />
    </div>
    {error ? <p className="mt-5 text-sm text-[#8a1f1f]">{error}</p> : null}
    <div className="mt-7 space-y-4">
      {reviews.map((review) => <article key={review.id} className="border border-[#ddd4c8] p-5">
        <div className="flex flex-wrap justify-between gap-4"><div><p className="font-medium">{review.product?.name}</p><p className="mt-1 text-sm text-[#514c45]">{review.customer?.name} · {review.rating}/5 · {review.status}{review.deletedAt ? ' · deleted' : ''}</p></div><p className="text-xs text-[#777777]">{new Date(review.createdAt).toLocaleDateString()}</p></div>
        {review.title ? <p className="mt-4 font-medium">{review.title}</p> : null}
        <p className="mt-2 text-sm leading-6 text-[#514c45]">{review.body}</p>
        {review.images?.length ? <div className="mt-4 flex flex-wrap gap-2">{review.images.map((image: any) => <a key={image.id} href={image.url} target="_blank" rel="noreferrer" className="relative h-16 w-16 overflow-hidden border border-[#ddd4c8]"><CloudinaryProductImage src={image.url} alt="Customer review" delivery="thumbnail" sizes="64px" className="object-cover" loading="lazy" /></a>)}</div> : null}
        <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => void moderate(review.id, 'APPROVED')} className="border border-[#111111] px-3 py-2 text-xs uppercase tracking-[0.08em]">Approve / restore</button><button type="button" onClick={() => void moderate(review.id, 'REJECTED')} className="border border-[#ddd4c8] px-3 py-2 text-xs uppercase tracking-[0.08em]">Reject</button><button type="button" onClick={() => void moderate(review.id, 'HIDDEN')} className="border border-[#ddd4c8] px-3 py-2 text-xs uppercase tracking-[0.08em]">Hide</button><button type="button" onClick={() => void remove(review.id)} className="border border-[#8a1f1f] px-3 py-2 text-xs uppercase tracking-[0.08em] text-[#8a1f1f]">Delete</button></div>
      </article>)}
    </div>
  </section>;
}
