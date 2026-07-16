import type { Metadata } from 'next';
import { OrderConfirmationPageContent } from '../../../../components/checkout/OrderConfirmationPageContent';
import { pageMetadata } from '../../../../lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Order Confirmation',
  description: 'Complete or review your private AEVRO order confirmation.',
  path: '/checkout/confirmation',
  noIndex: true,
});

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <OrderConfirmationPageContent orderId={id} />;
}
