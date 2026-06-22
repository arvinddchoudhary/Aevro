import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import {
  AdminProductsHeader,
  AdminProductsList,
} from '../../../components/admin/products/AdminProductsList';

export default function AdminProductsPage() {
  return (
    <main className="aevro-container min-h-screen py-14">
      <AdminRouteGuard>
        <AdminProductsHeader />
        <AdminProductsList />
      </AdminRouteGuard>
    </main>
  );
}
