'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { EmptyState } from '../ui/EmptyState';

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status === 'loading') {
    return (
      <EmptyState
        title="Loading admin"
        message="Checking your secure AEVRO admin session."
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

  if (user.role !== 'ADMIN') {
    return (
      <div className="border border-[#111111] px-6 py-12 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Access denied
        </p>
        <p className="mx-auto max-w-md text-sm leading-6 text-[#5f5a53]">
          This area is reserved for AEVRO administrators.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-flex h-12 items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3]"
        >
          Back to account
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
