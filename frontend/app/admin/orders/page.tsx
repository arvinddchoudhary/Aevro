import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { AdminOrdersPageContent } from '../../../components/admin/orders/AdminOrdersPageContent';

export default function AdminOrdersPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminOrdersPageContent />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
