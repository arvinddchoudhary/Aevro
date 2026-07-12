'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="pb-24 lg:pb-0">{children}</div>
      <Footer />
      {!pathname.startsWith('/admin') && <MobileBottomNav />}
    </>
  );
}
