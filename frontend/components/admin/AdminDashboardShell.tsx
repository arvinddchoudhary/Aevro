'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { EmptyState } from '../ui/EmptyState';

const adminSections = [
  {
    title: 'Products',
    description: 'Create catalog products, variants, stock, and product media.',
    href: '/admin/products',
  },
  {
    title: 'Orders',
    description: 'Review customer orders and update fulfillment status.',
    href: '/admin/orders',
  },
  {
    title: 'Uploads',
    description: 'Cloudinary-backed product media tools are planned for later.',
  },
  {
    title: 'Customers',
    description: 'Customer lookup and support tooling will be added later.',
  },
];

export function AdminDashboardShell() {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

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
        <p className="mx-auto max-w-md text-sm leading-6 text-[#555555]">
          This area is reserved for AEVRO administrators.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-flex h-12 items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white"
        >
          Back to account
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="h-fit border border-[#e5e5e5] p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
          Admin
        </p>
        <nav className="mt-6 space-y-3 text-sm">
          {adminSections.map((section) => (
            <div key={section.title} className="border-b border-[#eeeeee] pb-3 last:border-b-0">
              {section.href ? (
                <Link href={section.href} className="cursor-pointer hover:text-[#777777]">
                  {section.title}
                </Link>
              ) : (
                <span>{section.title}</span>
              )}
            </div>
          ))}
        </nav>
      </aside>

      <section>
        <div className="border-b border-[#e5e5e5] pb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
            AEVRO control
          </p>
          <h1 className="mt-4 text-4xl font-light md:text-5xl">
            Admin foundation
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#555555]">
            Role-gated admin access is active. The sections below are reserved
            placeholders for future operational tools.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {adminSections.map((section) => (
            <article key={section.title} className="border border-[#e5e5e5] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
                {section.title}
              </p>
              <p className="mt-4 text-sm leading-6 text-[#555555]">
                {section.description}
              </p>
              {section.href ? (
                <Link
                  href={section.href}
                  className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.12em] hover:bg-[#111111] hover:text-white"
                >
                  Open
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
