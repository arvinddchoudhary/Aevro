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
    <section className="min-h-[225px] border border-[#e1d8cc] bg-[#fffaf3]/76 p-5 shadow-[0_22px_70px_rgba(48,38,27,0.035)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f0e8de] text-[#2a251f]">
            <AccountIcon name={icon} className="h-6 w-6" />
          </span>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]">
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
      <div className="mt-6">{children}</div>
    </section>
  );
}
