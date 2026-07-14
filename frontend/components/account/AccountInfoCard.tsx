import type { ReactNode } from 'react';
import Link from 'next/link';
import { AccountIcon } from './AccountIcons';

type AccountInfoCardProps = {
  title: string;
  href?: string;
  actionLabel?: string;
  icon: Parameters<typeof AccountIcon>[0]['name'];
  children: ReactNode;
};

export function AccountInfoCard({
  actionLabel = 'View all',
  children,
  href,
  icon,
  title,
}: AccountInfoCardProps) {
  return (
    <section className="rounded-[8px] border border-[#e1d8cc] bg-[#fffaf3]/76 p-4 shadow-[0_18px_55px_rgba(48,38,27,0.035)] sm:min-h-[225px] sm:p-6 lg:rounded-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0e8de] text-[#2a251f] sm:flex sm:h-14 sm:w-14">
            <AccountIcon name={icon} className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <h3 className="min-w-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#111111] sm:tracking-[0.18em]">
            {title}
          </h3>
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-xs text-[#2f2a25] underline-offset-4 hover:underline"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      <div className="mt-4 sm:mt-6">{children}</div>
    </section>
  );
}
