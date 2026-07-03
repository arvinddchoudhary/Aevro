import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';
import { pageMetadata } from '../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Login',
  description: 'Sign in to your AEVRO account.',
  path: '/login',
  noIndex: true,
});

export default function LoginPage() {
  return (
    <AuthLayout
      sideImagePath="/images/SignIn-Samples/auth-login.webp"
      variant="background"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
