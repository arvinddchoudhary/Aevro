import type { Metadata } from 'next';
import { AdminRouteGuard } from '../../../../components/admin/AdminRouteGuard';
import { AdminLayout } from '../../../../components/admin/AdminLayout';
import { AdminOrderDetailPageContent } from '../../../../components/admin/orders/AdminOrderDetailPageContent';
import { pageMetadata } from '../../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Admin Order Detail',
  description: 'Private AEVRO admin order detail.',
  path: '/admin/orders',
  noIndex: true,
});

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <AdminOrderDetailPageContent orderId={id} />
      </AdminLayout>
    </AdminRouteGuard>
  );
}
