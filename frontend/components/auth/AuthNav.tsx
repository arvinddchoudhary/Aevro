'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';

export function AuthNav() {
  const router = useRouter();
  const { logout, status, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (status === 'loading') {
    return (
      <Link
        href="/account"
        className="cursor-pointer text-xs uppercase tracking-[0.16em] text-[#777777] underline-offset-8 hover:text-[#111111] hover:underline"
      >
        Account
      </Link>
    );
  }

  if (!user) {
    return (
      <Link href="/login" className="cursor-pointer underline-offset-8 hover:underline">
        Account
      </Link>
    );
  }

  return (
    <>
      <Link href="/account" className="cursor-pointer underline-offset-8 hover:underline">
        Account
      </Link>
      <button
        type="button"
        disabled={isLoggingOut}
        onClick={handleLogout}
        className="hidden cursor-pointer underline-offset-8 hover:underline disabled:cursor-not-allowed disabled:text-[#777777] sm:inline"
      >
        {isLoggingOut ? 'Logging out' : 'Logout'}
      </button>
    </>
  );
}
