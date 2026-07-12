import Link from 'next/link';
import type { AuthUser } from '../../types/auth';
import { AccountIcon } from './AccountIcons';

function formatMemberDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function AccountSummaryCard({ user }: { user: AuthUser }) {
  const initial = user.name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <section className="border border-[#e1d8cc] bg-[#fffaf3]/82 p-4 shadow-[0_26px_80px_rgba(48,38,27,0.045)] sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ede4d9] text-2xl font-light text-[#8b7c6b] sm:h-24 sm:w-24 sm:text-3xl">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="break-words font-serif text-[1.55rem] font-light leading-tight text-[#111111] sm:text-3xl">
              Welcome back, {user.name}
            </h2>
            <dl className="mt-4 flex min-w-0 flex-col gap-3 text-sm text-[#5f574f] md:flex-row md:flex-wrap md:items-center">
              <div className="flex min-w-0 items-center gap-2">
                <AccountIcon name="mail" className="h-4 w-4 shrink-0" />
                <dt className="sr-only">Email</dt>
                <dd className="truncate">{user.email}</dd>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <AccountIcon name="phone" className="h-4 w-4 shrink-0" />
                  <dt className="sr-only">Phone</dt>
                  <dd>{user.phone}</dd>
                </div>
              )}
              <div className="flex min-w-0 items-center gap-2">
                <AccountIcon name="calendar" className="h-4 w-4 shrink-0" />
                <dt className="sr-only">Member since</dt>
                <dd className="min-w-0 break-words">Member since {formatMemberDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>
        </div>
        <Link
          href="/account/profile"
          className="inline-flex h-12 w-full items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:w-auto"
          style={{ color: '#fffaf3' }}
        >
          Edit Profile
        </Link>
      </div>
    </section>
  );
}
