import type { Metadata } from 'next';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({ title: 'Reset Password', description: 'Reset your AEVRO account password.', path: '/forgot-password', noIndex: true });

export default function ForgotPasswordPage() {
  return <main className="aevro-container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12"><ForgotPasswordForm /></main>;
}
