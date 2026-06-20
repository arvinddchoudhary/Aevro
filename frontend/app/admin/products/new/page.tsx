import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminProductForm } from '../../../../components/admin/products/AdminProductForm';

export default function NewAdminProductPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8">
      <AdminRouteGuard>
        <div className="mb-8 border-b border-[#e5e5e5] pb-6">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
            Admin
          </p>
          <h1 className="text-4xl font-light md:text-5xl">New product</h1>
        </div>
        <AdminProductForm />
      </AdminRouteGuard>
    </main>
  );
}
