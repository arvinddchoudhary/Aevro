'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { AuthField } from './AuthField';
import { GoogleLoginButton } from './GoogleLoginButton';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = searchParams.get('redirect') || '/account';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push(redirectTo);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Login failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleSubmit} className="border border-[#ddd4c8] bg-[#fffaf3]/70 p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-[#77716a]">
          Customer login
        </p>
        <h1 className="mt-4 text-3xl font-light uppercase sm:text-4xl">Welcome back.</h1>
        <div className="mt-6 space-y-5 sm:mt-8">
          <AuthField
            label="Email"
            name="email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={setEmail}
          />
          <AuthField
            label="Password"
            name="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={setPassword}
          />
        </div>
        {error && <p className="mt-5 text-sm leading-6 text-[#8a1f1f]">{error}</p>}
        <button
          disabled={isSubmitting}
          className="mt-6 h-12 w-full bg-[#111111] text-xs font-medium uppercase tracking-[0.08em] text-[#fffaf3] hover:bg-[#2a2825] disabled:cursor-not-allowed disabled:border disabled:border-[#ddd4c8] disabled:bg-transparent disabled:text-[#777777]"
        >
          {isSubmitting ? 'Logging in' : 'Login'}
        </button>
        <div className="my-5 border-t border-[#ddd4c8]" />
        <GoogleLoginButton onError={setError} redirectTo={redirectTo} />
      </form>
      <p className="mt-5 text-center text-sm text-[#5f5a53]">
        New to AEVRO?{' '}
        <Link
          href={redirectTo === '/account' ? '/register' : `/register?redirect=${encodeURIComponent(redirectTo)}`}
          className="underline underline-offset-4"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
