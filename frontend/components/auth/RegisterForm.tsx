'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { AuthField } from './AuthField';
import { GoogleLoginButton } from './GoogleLoginButton';

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      router.push('/account');
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Registration failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <form onSubmit={handleSubmit} className="border border-[#ddd4c8] bg-[#fffaf3]/70 p-5 sm:p-8">
        <p className="text-xs uppercase tracking-[0.14em] text-[#77716a]">
          Create account
        </p>
        <h1 className="mt-4 text-3xl font-light uppercase sm:text-4xl">Start your AEVRO profile.</h1>
        <div className="mt-6 space-y-5 sm:mt-8">
          <AuthField
            label="Name"
            name="name"
            value={name}
            autoComplete="name"
            onChange={setName}
          />
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
            autoComplete="new-password"
            onChange={setPassword}
          />
        </div>
        <p className="mt-4 text-xs leading-5 text-[#777777]">
          Use at least 8 characters. Tokens are stored by the backend in
          httpOnly cookies, never in browser storage.
        </p>
        {error && <p className="mt-5 text-sm leading-6 text-[#8a1f1f]">{error}</p>}
        <button
          disabled={isSubmitting}
          className="mt-6 h-12 w-full bg-[#111111] text-xs font-medium uppercase tracking-[0.08em] text-[#fffaf3] hover:bg-[#2a2825] disabled:cursor-not-allowed disabled:border disabled:border-[#ddd4c8] disabled:bg-transparent disabled:text-[#777777]"
        >
          {isSubmitting ? 'Creating account' : 'Create account'}
        </button>
        <div className="my-5 border-t border-[#ddd4c8]" />
        <GoogleLoginButton onError={setError} />
      </form>
      <p className="mt-5 text-center text-sm text-[#5f5a53]">
        Already have an account?{' '}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </p>
    </div>
  );
}
