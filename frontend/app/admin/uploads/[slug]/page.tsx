import type { Metadata } from 'next';
import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../../components/admin/AdminLayout';
import { AdminUploadCategoryPageContent } from '../../../../components/admin/uploads/AdminUploadCategoryPageContent';
import { pageMetadata } from '../../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Admin Upload Category',
  description: 'Private AEVRO uploaded media category detail.',
  path: '/admin/uploads',
  noIndex: true,
});

export default async function AdminUploadCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminUploadCategoryPageContent slug={slug} />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
