import { AdminRouteGuard } from '../../../../../components/admin/AdminRouteGuard';
import { AdminProductEditPageContent } from '../../../../../components/admin/products/AdminProductEditPageContent';

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <AdminRouteGuard>
        <AdminProductEditPageContent productId={id} />
      </AdminRouteGuard>
    </main>
  );
}
