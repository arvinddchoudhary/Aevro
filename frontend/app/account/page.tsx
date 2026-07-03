import type { Metadata } from 'next';
import { AccountPageContent } from '../../components/auth/AccountPageContent';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'My Profile',
  description: 'Manage your AEVRO profile, saved addresses, orders, and wishlist.',
  path: '/account',
  noIndex: true,
});

export default function AccountPage() {
  return (
    <main className="min-h-screen">
      <AccountPageContent />
    </main>
  );
}
