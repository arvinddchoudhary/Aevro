'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { EmptyState } from '../ui/EmptyState';

export function AccountPageContent() {
  const router = useRouter();
  const { logout, status, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.replace('/login');
    router.refresh();
  };

  if (status === 'loading') {
    return (
      <EmptyState
        title="Loading account"
        message="Checking your secure AEVRO session."
      />
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="Login required"
        message="Redirecting you to login."
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="border border-[#ddd4c8] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
          Account
        </p>
        <h1 className="mt-4 text-4xl font-light md:text-5xl">{user.name}</h1>
        <div className="mt-8 border-y border-[#ddd4c8]">
          {[
            ['Email', user.email],
            ['Role', user.role],
            ['Email verified', user.emailVerified ? 'Yes' : 'No'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid grid-cols-[150px_1fr] border-b border-[#e7ded2] py-4 text-sm last:border-b-0"
            >
              <span className="text-[#777777]">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </section>

      <aside className="h-fit border border-[#ddd4c8] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
          Session
        </p>
        <p className="mt-4 text-sm leading-6 text-[#5f5a53]">
          Your session is managed with backend httpOnly cookies. No JWT token is
          stored in localStorage or sessionStorage.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/account/profile"
            className="inline-flex h-12 cursor-pointer items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3]"
          >
            Edit profile
          </Link>
          <Link
            href="/account/addresses"
            className="inline-flex h-12 cursor-pointer items-center justify-center border border-[#ddd4c8] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
          >
            Saved addresses
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex h-12 cursor-pointer items-center justify-center border border-[#ddd4c8] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
          >
            View orders
          </Link>
          <Link
            href="/products"
            className="inline-flex h-12 cursor-pointer items-center justify-center border border-[#ddd4c8] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="h-12 cursor-pointer border border-[#ddd4c8] text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#777777]"
          >
            {isLoggingOut ? 'Logging out' : 'Logout'}
          </button>
        </div>
      </aside>
    </div>
  );
}
