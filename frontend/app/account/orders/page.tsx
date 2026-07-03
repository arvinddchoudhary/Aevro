import type { Metadata } from 'next';
import { AccountOrdersPageContent } from '../../../components/orders/AccountOrdersPageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'My Orders',
  description: 'Track and manage your AEVRO orders.',
  path: '/account/orders',
  noIndex: true,
});

export default function AccountOrdersPage() {
  return (
    <main className="min-h-screen">
      <AccountOrdersPageContent />
    </main>
  );
}
