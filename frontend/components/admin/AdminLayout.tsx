'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminIcon } from './AdminIcons';

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Products', href: '/admin/products', icon: 'product' },
  { label: 'Orders', href: '/admin/orders', icon: 'bag' },
  { label: 'Reviews', href: '/admin/reviews', icon: 'star' },
  { label: 'Uploads', href: '/admin/uploads', icon: 'upload' },
  { label: 'Customers', href: '/admin/customers', icon: 'users' },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#fbf7f0]">
      <div className="grid min-h-screen lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="sticky top-[66px] z-20 border-b border-[#ddd4c8] bg-[#fbf7f0]/95 px-4 py-3 backdrop-blur sm:top-[74px] sm:px-5 sm:py-4 lg:top-20 lg:h-[calc(100vh-5rem)] lg:border-b-0 lg:border-r lg:px-8 lg:py-14">
          <p className="hidden text-xs uppercase tracking-[0.28em] text-[#77716a] lg:block">
            Admin
          </p>
          <nav className="flex snap-x gap-2 overflow-x-auto pb-1 lg:mt-7 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {adminNavItems.map((item) => {
              const active = item.href ? isActive(pathname, item.href) : false;
              const className = `flex h-11 shrink-0 snap-start cursor-pointer items-center gap-2.5 rounded-full px-4 text-sm transition lg:h-12 lg:w-full lg:rounded-[7px] ${
                active
                  ? 'bg-[#ede5da] text-[#111111]'
                  : item.href
                    ? 'text-[#171411] hover:bg-[#f2ece3]'
                    : 'cursor-not-allowed text-[#aaa197]'
              }`;
              const content = (
                <>
                  <AdminIcon name={item.icon} className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </>
              );

              return (
                <Link key={item.label} href={item.href} className={className}>
                  {content}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 hidden border border-[#e0d6ca] bg-[#fffaf3] p-5 shadow-[0_18px_60px_rgba(44,34,24,0.04)] lg:block">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] font-serif text-xl text-[#fffaf3]">
              A
            </div>
            <p className="mt-4 text-sm font-medium text-[#111111]">Need help?</p>
            <p className="mt-2 text-sm leading-6 text-[#625a51]">
              View docs or contact support.
            </p>
            <span className="mt-4 inline-flex text-[#a56f3c]">
              <AdminIcon name="arrow" className="h-4 w-4" />
            </span>
          </div>

          <div className="absolute bottom-8 hidden text-xs leading-7 tracking-[0.12em] text-[#8a8177] lg:block">
            <p>© 2026 AEVRO</p>
            <p>All rights reserved.</p>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-14 xl:px-16">
          {children}
        </main>
      </div>
    </div>
  );
}
