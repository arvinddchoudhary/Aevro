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
    await logout();
    setIsLoggingOut(false);
    router.push('/');
    router.refresh();
  };

  if (status === 'loading') {
    return (
      <span className="text-xs uppercase tracking-[0.16em] text-[#777777]">
        Account
      </span>
    );
  }

  if (!user) {
    return (
      <>
        <Link href="/login" className="underline-offset-4 hover:underline">
          Login
        </Link>
        <Link href="/register" className="underline-offset-4 hover:underline">
          Register
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/account" className="underline-offset-4 hover:underline">
        Account
      </Link>
      <button
        type="button"
        disabled={isLoggingOut}
        onClick={handleLogout}
        className="underline-offset-4 hover:underline disabled:text-[#777777]"
      >
        {isLoggingOut ? 'Logging out' : 'Logout'}
      </button>
    </>
  );
}
