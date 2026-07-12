'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AccountBenefitBar } from '../account/AccountBenefitBar';
import { AccountHero } from '../account/AccountHero';
import { AccountIcon } from '../account/AccountIcons';
import { AccountSidebar } from '../account/AccountSidebar';
import {
  deleteWishlistItem,
  deleteWishlistProduct,
  getWishlist,
} from '../../lib/api/wishlist';
import { useAuth } from '../../lib/auth';
import {
  markWishlistProductRemoved,
  syncWishlistProductIds,
} from '../../lib/wishlist-cache';
import type { WishlistItem } from '../../types/wishlist';
import { EmptyState } from '../ui/EmptyState';
import { WishlistProductCard } from './WishlistProductCard';

type SortOption = 'recent' | 'price_asc' | 'price_desc';
type LayoutOption = 'grid' | 'list';

function itemCountLabel(count: number) {
  return `${count} item${count === 1 ? '' : 's'}`;
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4 2xl:grid-cols-5">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="border border-[#e1d8cc] bg-[#fffaf3]/82 p-3">
          <span className="block aspect-[3/4] animate-pulse bg-[#eee5da]" />
          <span className="mt-4 block h-4 w-3/4 animate-pulse bg-[#eee5da]" />
          <span className="mt-3 block h-3 w-1/2 animate-pulse bg-[#eee5da]" />
          <span className="mt-4 block h-10 w-full animate-pulse bg-[#eee5da]" />
        </div>
      ))}
    </div>
  );
}

export function WishlistPageContent() {
  const router = useRouter();
  const { logout, status, user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [layout, setLayout] = useState<LayoutOption>('grid');
  const [message, setMessage] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('recent');

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const wishlistItems = await getWishlist();
      setItems(wishlistItems);
      syncWishlistProductIds(wishlistItems.map((item) => item.productId));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? `We could not load your wishlist. ${loadError.message}`
          : 'We could not load your wishlist.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?redirect=/account/wishlist');
    }

    if (status === 'authenticated') {
      void loadWishlist();
    }
  }, [router, status]);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, string>();

    items.forEach((item) => {
      if (item.product.category) {
        categoryMap.set(item.product.category.slug, item.product.category.name);
      }
    });

    return Array.from(categoryMap.entries()).map(([slug, name]) => ({ slug, name }));
  }, [items]);

  const visibleItems = useMemo(() => {
    return items
      .filter((item) => activeCategory === 'all' || item.product.category?.slug === activeCategory)
      .sort((firstItem, secondItem) => {
        if (sort === 'price_asc') {
          return firstItem.product.priceInPaise - secondItem.product.priceInPaise;
        }

        if (sort === 'price_desc') {
          return secondItem.product.priceInPaise - firstItem.product.priceInPaise;
        }

        return new Date(secondItem.createdAt).getTime() - new Date(firstItem.createdAt).getTime();
      });
  }, [activeCategory, items, sort]);

  const removeItem = async (item: WishlistItem) => {
    try {
      setMessage(null);
      try {
        await deleteWishlistItem(item.id);
      } catch {
        await deleteWishlistProduct(item.productId);
      }
      setItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id));
      markWishlistProductRemoved(item.productId);
      setMessage('Removed from wishlist.');
    } catch (removeError) {
      setMessage(
        removeError instanceof Error
          ? `Unable to remove item. ${removeError.message}`
          : 'Unable to remove item. Try again.',
      );
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.replace('/login');
    router.refresh();
  };

  if (status === 'loading') {
    return <EmptyState title="Loading wishlist" message="Checking your AEVRO session." />;
  }

  if (!user) {
    return <EmptyState title="Login required" message="Redirecting you to login." />;
  }

  return (
    <div className="bg-[#fbf7f0]">
      <AccountHero
        title="My Wishlist"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Wishlist' },
        ]}
      />

      <section className="aevro-container py-6 sm:py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[315px_minmax(0,1fr)]">
          <AccountSidebar isLoggingOut={isLoggingOut} onLogout={handleLogout} />

          <section className="min-w-0 border border-[#e1d8cc] bg-[#fffaf3]/82 shadow-[0_26px_80px_rgba(48,38,27,0.04)]">
            <div className="grid gap-5 border-b border-[#e5dbcf] p-4 sm:p-7 xl:grid-cols-[1fr_auto] xl:items-center">
              <div>
                <h1 className="font-serif text-2xl font-light text-[#111111] sm:text-3xl">
                  My Wishlist
                </h1>
                <p className="mt-2 text-sm text-[#625a51]">{itemCountLabel(items.length)}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,190px)_minmax(0,190px)_auto]">
                <label>
                  <span className="sr-only">Filter by category</span>
                  <select
                    value={activeCategory}
                    onChange={(event) => setActiveCategory(event.target.value)}
                    className="h-11 w-full border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#111111]"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">Sort wishlist</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOption)}
                    className="h-11 w-full border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm outline-none transition focus:border-[#111111]"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 border border-[#ddd4c8]">
                  {(['grid', 'list'] as LayoutOption[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLayout(option)}
                      className={`h-11 px-4 text-xs uppercase tracking-[0.08em] ${
                        layout === option ? 'bg-[#eee5da]' : 'bg-[#fffdf8]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {message && (
              <p className="mx-5 mt-5 border border-[#e1d8cc] bg-[#fffdf8] p-4 text-sm text-[#625a51] sm:mx-7">
                {message}
              </p>
            )}

            <div className="p-4 sm:p-7">
              {isLoading && <WishlistSkeleton />}

              {error && !isLoading && (
                <div className="border border-[#e5dbcf] bg-[#fffdf8] p-8 text-center sm:p-10">
                  <h2 className="font-serif text-2xl font-light text-[#111111]">
                    We could not load your wishlist.
                  </h2>
                  <button
                    type="button"
                    onClick={() => void loadWishlist()}
                    className="mt-6 inline-flex h-12 items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924]"
                    style={{ color: '#fffaf3' }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {!isLoading && !error && items.length === 0 && (
                <div className="border border-[#e5dbcf] bg-[#fffdf8] p-8 text-center sm:p-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e8de] text-[#211d18]">
                    <AccountIcon name="heart" className="h-8 w-8" />
                  </div>
                  <h2 className="mt-5 font-serif text-2xl font-light text-[#111111]">
                    Your wishlist is empty.
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#625a51]">
                    Save your favorite AEVRO pieces here.
                  </p>
                  <Link
                    href="/products"
                    className="mt-6 inline-flex h-12 w-full items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:w-auto"
                    style={{ color: '#fffaf3' }}
                  >
                    Start Shopping
                  </Link>
                </div>
              )}

              {!isLoading && !error && items.length > 0 && visibleItems.length === 0 && (
                <div className="border border-[#e5dbcf] bg-[#fffdf8] p-8 text-center sm:p-10">
                  <h2 className="font-serif text-2xl font-light text-[#111111]">
                    No saved pieces in this category.
                  </h2>
                </div>
              )}

              {!isLoading && !error && visibleItems.length > 0 && (
                <div
                  className={
                    layout === 'grid'
                      ? 'grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4 2xl:grid-cols-5'
                      : 'grid gap-3'
                  }
                >
                  {visibleItems.map((item) => (
                    <WishlistProductCard
                      key={item.id}
                      item={item}
                      layout={layout}
                      onMessage={setMessage}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <AccountBenefitBar />
    </div>
  );
}
