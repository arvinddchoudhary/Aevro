import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../../components/admin/AdminLayout';
import { AdminUploadCategoryPageContent } from '../../../../components/admin/uploads/AdminUploadCategoryPageContent';

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
