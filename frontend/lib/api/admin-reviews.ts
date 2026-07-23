import { authenticatedFetch } from './authenticated-request';

type AdminReview = any;

export async function getAdminReviews(query: Record<string, string | number | undefined> = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => { if (value !== undefined && value !== '') params.set(key, String(value)); });
  const response = await authenticatedFetch(`/admin/reviews${params.toString() ? `?${params}` : ''}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to load reviews.');
  return response.json() as Promise<{ success: true; data: AdminReview[]; meta: { page: number; hasNextPage: boolean } }>;
}

export async function moderateAdminReview(id: string, status: 'APPROVED' | 'REJECTED' | 'HIDDEN', reason?: string) {
  const response = await authenticatedFetch(`/admin/reviews/${encodeURIComponent(id)}/moderation`, { method: 'PATCH', body: JSON.stringify({ status, reason }) });
  if (!response.ok) throw new Error('Unable to moderate review.');
  return response.json();
}

export async function deleteAdminReview(id: string, reason: string) {
  const response = await authenticatedFetch(`/admin/reviews/${encodeURIComponent(id)}`, { method: 'DELETE', body: JSON.stringify({ reason }) });
  if (!response.ok) throw new Error('Unable to remove review.');
  return response.json();
}
