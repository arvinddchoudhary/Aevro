import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../../components/admin/AdminLayout';
import { AdminOrderDetailPageContent } from '../../../../components/admin/orders/AdminOrderDetailPageContent';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminOrderDetailPageContent orderId={id} />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
