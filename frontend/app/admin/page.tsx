import type { Metadata } from 'next';
import { AdminDashboardShell } from '../../components/admin/AdminDashboardShell';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Admin Overview',
  description: 'Private AEVRO admin overview.',
  path: '/admin',
  noIndex: true,
});

export default function AdminPage() {
  return <AdminDashboardShell />;
}
