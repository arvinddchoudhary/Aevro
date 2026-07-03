import type { Metadata } from 'next';
import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../../components/admin/AdminLayout';
import { AdminProductForm } from '../../../../components/admin/products/AdminProductForm';
import { pageMetadata } from '../../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'New Admin Product',
  description: 'Private AEVRO product creation.',
  path: '/admin/products/new',
  noIndex: true,
});

export default function NewAdminProductPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
            Admin catalog
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light leading-none text-[#111111] sm:text-5xl lg:text-6xl">
            New product
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#625a51]">
            Create a clothing product with category, pricing, color variants,
            size stock, and Cloudinary-hosted product images.
          </p>
        </div>
        <AdminProductForm />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
