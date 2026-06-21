import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminOrderDetailPageContent } from '../../../../components/admin/orders/AdminOrderDetailPageContent';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <AdminRouteGuard>
        <AdminOrderDetailPageContent orderId={id} />
      </AdminRouteGuard>
    </main>
  );
}
