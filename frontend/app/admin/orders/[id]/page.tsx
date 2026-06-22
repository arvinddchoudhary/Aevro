import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminOrderDetailPageContent } from '../../../../components/admin/orders/AdminOrderDetailPageContent';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="aevro-container min-h-screen py-14">
      <AdminRouteGuard>
        <AdminOrderDetailPageContent orderId={id} />
      </AdminRouteGuard>
    </main>
  );
}
