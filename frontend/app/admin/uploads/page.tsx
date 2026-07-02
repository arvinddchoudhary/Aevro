import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { AdminUploadsPageContent } from '../../../components/admin/uploads/AdminUploadsPageContent';

export default function AdminUploadsPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminUploadsPageContent />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
