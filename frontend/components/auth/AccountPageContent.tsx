'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getMyOrders } from '../../lib/api/orders';
import { getUserAddresses } from '../../lib/api/users';
import { getWishlist } from '../../lib/api/wishlist';
import { useAuth } from '../../lib/auth';
import { formatPrice } from '../../lib/format';
import type { Order } from '../../types/orders';
import type { UserAddress } from '../../types/user';
import type { WishlistItem } from '../../types/wishlist';
import { AccountBenefitBar } from '../account/AccountBenefitBar';
import { AccountHero } from '../account/AccountHero';
import { AccountIcon } from '../account/AccountIcons';
import { AccountInfoCard } from '../account/AccountInfoCard';
import { AccountSidebar } from '../account/AccountSidebar';
import { AccountSummaryCard } from '../account/AccountSummaryCard';
import { EmptyState } from '../ui/EmptyState';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 text-sm sm:grid-cols-[150px_1fr]">
      <dt className="text-[#6e665d]">{label}</dt>
      <dd className="min-w-0 break-words text-[#211d18]">{value}</dd>
    </div>
  );
}

function formatAddress(address: UserAddress) {
  return [
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ].filter(Boolean);
}

function orderImage(order: Order) {
  return order.items.find((item) => item.product?.images?.[0])?.product?.images[0] ?? null;
}

function wishlistImage(item: WishlistItem) {
  return item.product.primaryImage ?? item.product.images[0] ?? null;
}

export function AccountPageContent() {
  const router = useRouter();
  const { logout, status, user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    let isMounted = true;

    async function loadDashboardData() {
      setIsDashboardLoading(true);
      setDashboardError(null);

      const [addressResult, orderResult, wishlistResult] = await Promise.allSettled([
        getUserAddresses(),
        getMyOrders(),
        getWishlist(),
      ]);

      if (!isMounted) {
        return;
      }

      if (addressResult.status === 'fulfilled') {
        setAddresses(addressResult.value);
      } else {
        setAddresses([]);
        setDashboardError('Some account details could not be loaded.');
      }

      if (orderResult.status === 'fulfilled' && orderResult.value.success) {
        setOrders(orderResult.value.data);
      } else {
        setOrders([]);
        setDashboardError('Some account details could not be loaded.');
      }

      if (wishlistResult.status === 'fulfilled') {
        setWishlistItems(wishlistResult.value);
      } else {
        setWishlistItems([]);
        setDashboardError('Some account details could not be loaded.');
      }

      setIsDashboardLoading(false);
    }

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [status]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.replace('/login');
    router.refresh();
  };

  if (status === 'loading') {
    return (
      <EmptyState
        title="Loading account"
        message="Checking your secure AEVRO session."
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

  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const recentOrders = orders.slice(0, 3);
  const wishlistPreviewItems = wishlistItems.slice(0, 4);

  return (
    <div className="bg-[#fbf7f0]">
      <AccountHero />
      <section className="aevro-container py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[315px_minmax(0,1fr)]">
          <AccountSidebar isLoggingOut={isLoggingOut} onLogout={handleLogout} />

          <div className="min-w-0 space-y-5 sm:space-y-6">
            <AccountSummaryCard user={user} />

            {user.role === 'ADMIN' && (
              <div className="flex flex-col gap-4 border border-[#ddd4c8] bg-[#fffaf3] p-5 shadow-[0_18px_60px_rgba(44,34,24,0.035)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a56f3c]">
                    Admin access
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#625a51]">
                    Manage AEVRO catalog, homepage content, and customer orders.
                  </p>
                </div>
                <Link
                  href="/admin"
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:w-auto"
                  style={{ color: '#fffaf3' }}
                >
                  Open Admin
                </Link>
              </div>
            )}

            {dashboardError && (
              <p className="border border-[#d8c8b8] bg-[#fffaf3] p-4 text-sm text-[#6b6258]">
                {dashboardError}
              </p>
            )}

            <div className="grid gap-5 xl:grid-cols-2">
              <AccountInfoCard
                title="Personal Details"
                href="/account/profile"
                actionLabel="Edit"
                icon="profile"
              >
                <dl className="space-y-3">
                  <FieldRow label="Full Name" value={user.name} />
                  <FieldRow label="Email Address" value={user.email} />
                  <FieldRow label="Phone Number" value={user.phone ?? 'Not added'} />
                  <FieldRow
                    label="Email Verified"
                    value={user.emailVerified ? 'Yes' : 'Pending'}
                  />
                </dl>
              </AccountInfoCard>

              <AccountInfoCard title="Saved Address" href="/account/addresses" icon="address">
                {isDashboardLoading ? (
                  <p className="text-sm text-[#6e665d]">Loading saved address.</p>
                ) : defaultAddress ? (
                  <div className="text-sm leading-6 text-[#2f2a25]">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="font-medium">{defaultAddress.label}</span>
                      {defaultAddress.isDefault && (
                        <span className="bg-[#eee5da] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#5f574f]">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-medium">{defaultAddress.fullName}</p>
                    {formatAddress(defaultAddress).map((line, index) => (
                      <p key={`${line}-${index}`}>{line}</p>
                    ))}
                    <p>{defaultAddress.phone}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[#6e665d]">No saved address yet.</p>
                    <Link
                      href="/account/addresses"
                      className="mt-4 inline-flex h-10 items-center justify-center border border-[#111111] px-5 text-xs font-medium uppercase tracking-[0.08em] transition hover:bg-[#111111] hover:text-[#fffaf3]"
                    >
                      Add Address
                    </Link>
                  </div>
                )}
              </AccountInfoCard>

              <AccountInfoCard title="Recent Orders" href="/account/orders" icon="bag">
                {isDashboardLoading ? (
                  <p className="text-sm text-[#6e665d]">Loading recent orders.</p>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order) => {
                      const image = orderImage(order);

                      return (
                        <Link
                          key={order.id}
                          href={`/account/orders/${order.id}`}
                          className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#eee5da] pb-3 last:border-b-0 last:pb-0"
                        >
                          <span className="block h-12 w-11 overflow-hidden bg-[#eee5da]">
                            {image ? (
                              <img
                                src={image.url}
                                alt={image.altText ?? order.items[0]?.productName ?? 'Order item'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[#8a8177]">
                                <AccountIcon name="bag" className="h-5 w-5" />
                              </span>
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-[#211d18]">
                              Order {order.orderNumber}
                            </span>
                            <span className="block text-xs text-[#6e665d]">
                              {formatDate(order.createdAt)}
                            </span>
                          </span>
                          <span className="text-right">
                            <span className="block text-sm text-[#211d18]">
                              {formatPrice(order.totalInPaise)}
                            </span>
                            <span className="mt-1 inline-flex bg-[#eee5da] px-3 py-1 text-[11px] uppercase tracking-[0.08em] text-[#5f574f]">
                              {order.status}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[#6e665d]">No orders yet.</p>
                    <Link
                      href="/products"
                      className="mt-4 inline-flex h-10 items-center justify-center border border-[#111111] px-5 text-xs font-medium uppercase tracking-[0.08em] transition hover:bg-[#111111] hover:text-[#fffaf3]"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </AccountInfoCard>

              <AccountInfoCard title="Wishlist Preview" href="/account/wishlist" icon="heart">
                {isDashboardLoading ? (
                  <p className="text-sm text-[#6e665d]">Loading saved pieces.</p>
                ) : wishlistPreviewItems.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {wishlistPreviewItems.map((item) => {
                        const image = wishlistImage(item);

                        return (
                          <Link
                            key={item.id}
                            href={`/products/${item.product.slug}`}
                            className="group min-w-0"
                          >
                            <span className="block aspect-[3/4] overflow-hidden bg-[#eee5da]">
                              {image ? (
                                <img
                                  src={image.url}
                                  alt={image.altText ?? item.product.name}
                                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-[#8a8177]">
                                  <AccountIcon name="bag" className="h-6 w-6" />
                                </span>
                              )}
                            </span>
                            <span className="mt-2 block truncate text-xs text-[#211d18]">
                              {item.product.name}
                            </span>
                            <span className="mt-1 block text-xs font-medium text-[#5f574f]">
                              {formatPrice(item.product.priceInPaise)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                    <Link
                      href="/account/wishlist"
                      className="mt-5 inline-flex h-10 items-center justify-center border border-[#ddd4c8] px-5 text-xs font-medium uppercase tracking-[0.08em] transition hover:border-[#111111]"
                    >
                      View Wishlist
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm leading-6 text-[#6e665d]">
                      No saved pieces yet. Save your favorite AEVRO styles to see
                      them here.
                    </p>
                    <Link
                      href="/products"
                      className="mt-4 inline-flex h-10 items-center justify-center border border-[#ddd4c8] px-5 text-xs font-medium uppercase tracking-[0.08em] transition hover:border-[#111111]"
                    >
                      Browse Collection
                    </Link>
                  </div>
                )}
              </AccountInfoCard>
            </div>
          </div>
        </div>
      </section>
      <AccountBenefitBar />
    </div>
  );
}
