import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminProductForm } from '../../../../components/admin/products/AdminProductForm';

export default function NewAdminProductPage() {
  return (
    <main className="aevro-container min-h-screen py-14">
      <AdminRouteGuard>
        <div className="mb-10 border-b border-[#ddd4c8] pb-8">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
            Admin catalog
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-light md:text-5xl">New product</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f5a53]">
                Create a clothing product with category, pricing, color variants,
                size stock, and Cloudinary-hosted product images.
              </p>
            </div>
          </div>
        </div>
        <AdminProductForm />
      </AdminRouteGuard>
    </main>
  );
}
