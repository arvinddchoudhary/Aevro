'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AccountIcon } from './AccountIcons';

type AccountSidebarProps = {
  className?: string;
  isLoggingOut: boolean;
  onLogout: () => void;
  title?: string;
};

const linkedItems = [
  { label: 'Profile', href: '/account', icon: 'profile' },
  { label: 'Orders', href: '/account/orders', icon: 'bag' },
  { label: 'Addresses', href: '/account/addresses', icon: 'address' },
  { label: 'Wishlist', href: '/account/wishlist', icon: 'heart' },
  { label: 'Payment Methods', href: '/account/payment-methods', icon: 'card' },
] as const;

const futureItems = [] as Array<{ label: string; icon: 'card' }>;

export function AccountSidebar({
  className = '',
  isLoggingOut,
  onLogout,
  title,
}: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`h-fit overflow-hidden rounded-[8px] border border-[#e1d8cc] bg-[#fffaf3]/82 shadow-[0_18px_55px_rgba(48,38,27,0.04)] lg:sticky lg:top-28 lg:rounded-none lg:p-2 ${className}`}>
      {title ? (
        <p className="px-4 pb-2 pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#211d18] lg:hidden">
          {title}
        </p>
      ) : null}
      <nav
        aria-label="Account navigation"
        className="block lg:overflow-visible"
      >
        {linkedItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/account' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-[52px] w-full items-center gap-3 border-b border-[#eee5da] px-4 text-sm transition last:border-b-0 hover:bg-[#f2eadf] lg:min-h-12 lg:rounded-none lg:border-b-0 ${
                isActive
                  ? 'bg-[#eee5da] text-[#111111] before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-[#544a3e] lg:before:hidden'
                  : 'text-[#2f2a25]'
              }`}
            >
              <AccountIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
              <span className="min-w-0 flex-1">{item.label}</span>
              <span aria-hidden="true" className="text-xl font-light leading-none lg:hidden">›</span>
            </Link>
          );
        })}

        {futureItems.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled
            title="Coming soon"
            className="flex min-h-12 shrink-0 cursor-not-allowed items-center gap-3 px-4 text-sm text-[#8a8177] opacity-70 lg:w-full"
          >
            <AccountIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}

        <div className="hidden border-t border-[#e1d8cc] pt-2 lg:mt-2 lg:block" />
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={onLogout}
          className="flex min-h-[52px] w-full items-center gap-3 px-4 text-sm text-[#2f2a25] transition hover:bg-[#f2eadf] disabled:cursor-not-allowed disabled:text-[#8a8177] lg:min-h-12"
        >
          <AccountIcon name="logout" className="h-[18px] w-[18px] shrink-0" />
          <span className="min-w-0 flex-1 text-left">{isLoggingOut ? 'Logging out' : 'Logout'}</span>
          <span aria-hidden="true" className="text-xl font-light leading-none lg:hidden">›</span>
        </button>
      </nav>
    </aside>
  );
}
