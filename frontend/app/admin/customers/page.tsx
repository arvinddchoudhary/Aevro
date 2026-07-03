import type { Metadata } from 'next';
import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { AdminCustomersPageContent } from '../../../components/admin/customers/AdminCustomersPageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Admin Customers',
  description: 'Private AEVRO customer management.',
  path: '/admin/customers',
  noIndex: true,
});

export default function AdminCustomersPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminCustomersPageContent />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
