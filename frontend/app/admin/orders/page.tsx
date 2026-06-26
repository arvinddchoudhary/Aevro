import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminOrdersPageContent } from '../../../components/admin/orders/AdminOrdersPageContent';

export default function AdminOrdersPage() {
  return (
    <main className="aevro-container min-h-screen py-8 sm:py-14">
      <AdminRouteGuard>
        <AdminOrdersPageContent />
      </AdminRouteGuard>
    </main>
  );
}
