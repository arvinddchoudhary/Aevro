import type { Metadata } from 'next';
import { AccountOrderDetailsPageContent } from '../../../../components/orders/AccountOrderDetailsPageContent';
import { pageMetadata } from '../../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Order Details',
  description: 'View private AEVRO order details.',
  path: '/account/orders',
  noIndex: true,
});

export default async function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="aevro-container min-h-screen py-14">
      <AccountOrderDetailsPageContent id={id} />
    </main>
  );
}
