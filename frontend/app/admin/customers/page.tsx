import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { AdminCustomersPageContent } from '../../../components/admin/customers/AdminCustomersPageContent';

export default function AdminCustomersPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminCustomersPageContent />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
