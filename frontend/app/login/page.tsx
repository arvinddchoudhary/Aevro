import { Suspense } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="aevro-container flex min-h-screen items-center py-8 sm:py-14">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
