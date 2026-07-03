import type { Metadata } from 'next';
import { AddressesPageContent } from '../../../components/account/AddressesPageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Saved Addresses',
  description: 'Manage saved shipping addresses for your AEVRO account.',
  path: '/account/addresses',
  noIndex: true,
});

export default function AccountAddressesPage() {
  return (
    <main className="min-h-screen">
      <AddressesPageContent />
    </main>
  );
}
