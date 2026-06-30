import { Suspense } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

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
