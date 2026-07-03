import type { Metadata } from 'next';
import { AdminHomepagePageContent } from '../../../components/admin/homepage/AdminHomepagePageContent';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Admin Homepage',
  description: 'Private AEVRO homepage content management.',
  path: '/admin/homepage',
  noIndex: true,
});

export default function AdminHomepagePage() {
  return (
    <AdminLayout>
      <AdminHomepagePageContent />
    </AdminLayout>
  );
}
