import type { Metadata } from 'next';
import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { AdminOrdersPageContent } from '../../../components/admin/orders/AdminOrdersPageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Admin Orders',
  description: 'Private AEVRO order management.',
  path: '/admin/orders',
  noIndex: true,
});

export default function AdminOrdersPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminOrdersPageContent />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
