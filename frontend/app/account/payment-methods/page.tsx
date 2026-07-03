import type { Metadata } from 'next';
import { PaymentMethodsPageContent } from '../../../components/account/PaymentMethodsPageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Payment Methods',
  description: 'View secure payment method options for your AEVRO account.',
  path: '/account/payment-methods',
  noIndex: true,
});

export default function AccountPaymentMethodsPage() {
  return (
    <main className="min-h-screen">
      <PaymentMethodsPageContent />
    </main>
  );
}
