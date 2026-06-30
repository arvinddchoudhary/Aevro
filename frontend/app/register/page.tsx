import { Suspense } from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';

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
