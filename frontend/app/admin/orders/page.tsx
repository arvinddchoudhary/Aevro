import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminOrdersPageContent } from '../../../components/admin/orders/AdminOrdersPageContent';

export default function AdminOrdersPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <AdminRouteGuard>
        <AdminOrdersPageContent />
      </AdminRouteGuard>
    </main>
  );
}
