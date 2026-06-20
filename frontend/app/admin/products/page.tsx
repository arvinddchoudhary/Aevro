import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import {
  AdminProductsHeader,
  AdminProductsList,
} from '../../../components/admin/products/AdminProductsList';

export default function AdminProductsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <AdminRouteGuard>
        <AdminProductsHeader />
        <AdminProductsList />
      </AdminRouteGuard>
    </main>
  );
}
