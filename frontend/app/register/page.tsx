import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Create Account',
  description: 'Create your AEVRO account to manage orders, addresses, wishlist, and profile details.',
  path: '/register',
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <AuthLayout
      sideImagePath="/images/SignIn-Samples/auth-signup.webp"
      variant="background"
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
