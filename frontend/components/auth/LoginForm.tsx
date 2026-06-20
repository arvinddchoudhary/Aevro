'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { AuthField } from './AuthField';
import { GoogleLoginButton } from './GoogleLoginButton';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push('/account');
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
      <form onSubmit={handleSubmit} className="border border-[#e5e5e5] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
          Customer login
        </p>
        <h1 className="mt-4 text-4xl font-light">Welcome back.</h1>
        <div className="mt-8 space-y-5">
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
          className="mt-6 h-12 w-full border border-[#111111] text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#bdbdbd] disabled:text-[#777777] disabled:hover:bg-white"
        >
          {isSubmitting ? 'Logging in' : 'Login'}
        </button>
        <div className="my-5 border-t border-[#e5e5e5]" />
        <GoogleLoginButton onError={setError} />
      </form>
      <p className="mt-5 text-center text-sm text-[#555555]">
        New to AEVRO?{' '}
        <Link href="/register" className="underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
