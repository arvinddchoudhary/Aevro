'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { EmptyState } from '../ui/EmptyState';
import { AccountBenefitBar } from './AccountBenefitBar';
import { AccountHero } from './AccountHero';
import { AccountIcon } from './AccountIcons';
import { AccountSidebar } from './AccountSidebar';
import { PaymentNoticeModal } from './PaymentNoticeModal';
import { PaymentOptionCard } from './PaymentOptionCard';

export function PaymentMethodsPageContent() {
  const router = useRouter();
  const { logout, status, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState<string | null>(null);

  const openNotice = (title: string) => {
    setNoticeTitle(title);
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?redirect=/account/payment-methods');
    }
  }, [router, status]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.replace('/login');
    router.refresh();
  };

  if (status === 'loading') {
    return <EmptyState title="Loading payment methods" message="Checking your AEVRO session." />;
  }

  if (!user) {
    return <EmptyState title="Login required" message="Redirecting you to login." />;
  }

  return (
    <div className="bg-[#fbf7f0]">
      <AccountHero
        title="Payment Methods"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Payment Methods' },
        ]}
      />

      <section className="aevro-container py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[315px_minmax(0,1fr)]">
          <AccountSidebar isLoggingOut={isLoggingOut} onLogout={handleLogout} />

          <div className="min-w-0 space-y-5">
            <section className="border border-[#e1d8cc] bg-[#fffaf3]/82 p-5 shadow-[0_26px_80px_rgba(48,38,27,0.04)] sm:p-7">
              <div className="flex flex-col gap-5 border-b border-[#e5dbcf] pb-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="font-serif text-2xl font-light text-[#111111] sm:text-3xl">
                    Saved Payment Methods
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#625a51]">
                    Manage your saved cards and payment methods.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openNotice('Add New Card')}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:w-auto"
                  style={{ color: '#fffaf3' }}
                >
                  <AccountIcon name="plus" className="h-4 w-4" />
                  Add New Card
                </button>
              </div>

              <div className="mt-6 border border-[#e5dbcf] bg-[#fffdf8] p-8 text-center sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e8de] text-[#211d18]">
                  <AccountIcon name="card" className="h-8 w-8" />
                </div>
                <h2 className="mt-5 font-serif text-2xl font-light text-[#111111]">
                  No saved payment methods yet.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#625a51]">
                  You can pay securely during checkout. Saved cards will be
                  available after secure payment partner tokenization is enabled.
                </p>
                <button
                  type="button"
                  onClick={() => openNotice('Saved Cards Coming Soon')}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:w-auto"
                  style={{ color: '#fffaf3' }}
                >
                  Learn More
                </button>
              </div>
            </section>

            <section className="rounded-[8px] border border-[#e1d8cc] bg-[#fffaf3]/82 px-6 py-8 shadow-[0_26px_80px_rgba(48,38,27,0.035)] sm:px-9 sm:py-10">
              <div>
                <h2 className="font-serif text-3xl font-light leading-tight text-[#111111] sm:text-4xl">
                  More Payment Options
                </h2>
                <p className="mt-4 text-lg leading-7 text-[#625a51] sm:text-xl">
                  Add or manage other payment methods.
                </p>
              </div>
              <div className="mt-8 grid gap-5 xl:grid-cols-2">
                <PaymentOptionCard
                  badge="UPI"
                  visual="upi"
                  title="UPI"
                  detail="Pay seamlessly using UPI apps"
                  buttonLabel="Add UPI"
                  onAction={() => openNotice('UPI Support Coming Soon')}
                />
                <PaymentOptionCard
                  badge="Wallet"
                  visual="wallet"
                  title="Wallets"
                  detail="Pay using your saved wallets"
                  buttonLabel="Manage"
                  onAction={() => openNotice('Wallet Support Coming Soon')}
                />
              </div>
            </section>
          </div>
        </div>
      </section>

      <AccountBenefitBar />

      <PaymentNoticeModal
        isOpen={Boolean(noticeTitle)}
        title={noticeTitle ?? 'Payment Methods'}
        onClose={() => setNoticeTitle(null)}
      />
    </div>
  );
}
