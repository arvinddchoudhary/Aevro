import type { Metadata } from 'next';
import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { AdminUploadsPageContent } from '../../../components/admin/uploads/AdminUploadsPageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Admin Uploads',
  description: 'Private AEVRO uploaded media management.',
  path: '/admin/uploads',
  noIndex: true,
});

export default function AdminUploadsPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminUploadsPageContent />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
