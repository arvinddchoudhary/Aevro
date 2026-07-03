import type { Metadata } from 'next';
import { AdminRouteGuard } from '../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import {
  AdminProductsHeader,
  AdminProductsList,
} from '../../../components/admin/products/AdminProductsList';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Admin Products',
  description: 'Private AEVRO product management.',
  path: '/admin/products',
  noIndex: true,
});

export default function AdminProductsPage() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminProductsHeader />
        <AdminProductsList />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
