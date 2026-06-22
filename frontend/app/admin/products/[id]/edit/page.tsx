import { AdminRouteGuard } from '../../../../../components/admin/AdminRouteGuard';
import { AdminProductEditPageContent } from '../../../../../components/admin/products/AdminProductEditPageContent';

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="aevro-container min-h-screen py-14">
      <AdminRouteGuard>
        <AdminProductEditPageContent productId={id} />
      </AdminRouteGuard>
    </main>
  );
}
