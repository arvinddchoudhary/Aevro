import type { Metadata } from 'next';
import { ProfilePageContent } from '../../../components/account/ProfilePageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Edit Profile',
  description: 'Update your AEVRO account profile details.',
  path: '/account/profile',
  noIndex: true,
});

export default function AccountProfilePage() {
  return (
    <main className="aevro-container min-h-screen py-8 sm:py-14">
      <ProfilePageContent />
    </main>
  );
}
