'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AccountIcon } from './AccountIcons';

type AccountSidebarProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

const linkedItems = [
  { label: 'Profile', href: '/account', icon: 'profile' },
  { label: 'Orders', href: '/account/orders', icon: 'bag' },
  { label: 'Addresses', href: '/account/addresses', icon: 'address' },
  { label: 'Wishlist', href: '/account/wishlist', icon: 'heart' },
  { label: 'Payment Methods', href: '/account/payment-methods', icon: 'card' },
] as const;

const futureItems = [] as Array<{ label: string; icon: 'card' }>;

export function AccountSidebar({ isLoggingOut, onLogout }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="h-fit border border-[#e1d8cc] bg-[#fffaf3]/78 p-2 shadow-[0_24px_70px_rgba(48,38,27,0.04)] lg:sticky lg:top-28">
      <nav
        aria-label="Account navigation"
        className="flex gap-2 overflow-x-auto lg:block lg:overflow-visible"
      >
        {linkedItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/account' && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 shrink-0 items-center gap-3 px-4 text-sm transition hover:bg-[#f2eadf] lg:w-full ${
                isActive ? 'bg-[#eee5da] text-[#111111]' : 'text-[#2f2a25]'
              }`}
            >
              <AccountIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
              <span>{item.label}</span>
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
          className="flex min-h-12 shrink-0 items-center gap-3 px-4 text-sm text-[#2f2a25] transition hover:bg-[#f2eadf] disabled:cursor-not-allowed disabled:text-[#8a8177] lg:w-full"
        >
          <AccountIcon name="logout" className="h-[18px] w-[18px] shrink-0" />
          <span>{isLoggingOut ? 'Logging out' : 'Logout'}</span>
        </button>
      </nav>
    </aside>
  );
}
