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
    <section className="rounded-[8px] border border-[#e1d8cc] bg-[#fffaf3]/82 p-4 shadow-[0_20px_60px_rgba(48,38,27,0.04)] sm:p-7 lg:rounded-none">
      <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 min-[390px]:grid-cols-[64px_minmax(0,1fr)_auto] min-[390px]:gap-4 sm:grid-cols-[96px_minmax(0,1fr)_auto] lg:grid-cols-[1fr_auto] lg:gap-5">
        <div className="contents lg:flex lg:min-w-0 lg:items-center lg:gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ede4d9] text-xl font-light text-[#8b7c6b] min-[390px]:h-16 min-[390px]:w-16 sm:h-24 sm:w-24 sm:text-3xl">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-[#514c45]">Welcome back,</p>
            <h2 className="break-words font-serif text-[1.42rem] font-light leading-tight text-[#111111] sm:text-3xl">
              {user.name}
            </h2>
            <dl className="mt-2 flex min-w-0 flex-col gap-1.5 text-[0.72rem] text-[#5f574f] sm:mt-4 sm:gap-3 sm:text-sm md:flex-row md:flex-wrap md:items-center">
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
          className="col-span-2 inline-flex h-11 w-full items-center justify-center rounded-[3px] bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.1em] text-[#fffaf3] transition hover:bg-[#2d2924] min-[390px]:col-span-1 min-[390px]:w-auto sm:h-12 sm:px-6 sm:text-sm"
          style={{ color: '#fffaf3' }}
        >
          Edit Profile
        </Link>
      </div>
    </section>
  );
}
