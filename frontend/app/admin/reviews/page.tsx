import type { Metadata } from 'next';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminReviewsPageContent } from '../../../components/admin/reviews/AdminReviewsPageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Admin Reviews', description: 'Private AEVRO review moderation.', path: '/admin/reviews', noIndex: true });

export default function AdminReviewsPage() { return <AdminRouteGuard><AdminLayout><AdminReviewsPageContent /></AdminLayout></AdminRouteGuard>; }
