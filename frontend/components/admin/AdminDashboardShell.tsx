'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { getAdminOrders } from '../../lib/api/admin-orders';
import { getAdminProducts } from '../../lib/api/admin-products';
import type { AdminOrder } from '../../types/admin/orders';
import type { AdminProduct } from '../../types/admin/products';
import { EmptyState } from '../ui/EmptyState';
import { AdminActionCard, AdminMetricCard } from './AdminCards';
import { AdminLayout } from './AdminLayout';

const adminActions = [
  {
    title: 'Homepage',
    description: 'Manage homepage sections, banners, and dynamic content.',
    href: '/admin/homepage',
    icon: 'home',
  },
  {
    title: 'Products',
    description: 'Create catalog products, variants, stock, and product media.',
    href: '/admin/products',
    icon: 'product',
  },
  {
    title: 'Orders',
    description: 'Review customer orders and update fulfillment status.',
    href: '/admin/orders',
    icon: 'bag',
  },
  {
    title: 'Uploads',
    description: 'Review Cloudinary-backed product media across catalog variants.',
    href: '/admin/uploads',
    icon: 'upload',
  },
  {
    title: 'Customers',
    description: 'Review customer records derived from existing order history.',
    href: '/admin/customers',
    icon: 'users',
  },
] as const;

export function AdminDashboardShell() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== 'authenticated' || user?.role !== 'ADMIN') {
      return;
    }

    void Promise.allSettled([
      getAdminOrders({ limit: 100 }),
      getAdminProducts(),
    ]).then(([orderResult, productResult]) => {
      if (orderResult.status === 'fulfilled') {
        setOrders(orderResult.value.data);
      }

      if (productResult.status === 'fulfilled') {
        setProducts(productResult.value);
      }
    });
  }, [status, user?.role]);

  const metrics = useMemo(
    () => [
      {
        icon: 'bag' as const,
        label: 'Total Orders',
        value: orders.length,
        href: '/admin/orders',
        linkLabel: 'View all orders',
      },
      {
        icon: 'product' as const,
        label: 'Products',
        value: products.length,
        href: '/admin/products',
        linkLabel: 'View products',
      },
      {
        icon: 'upload' as const,
        label: 'Uploads',
        value: products.reduce(
          (total, product) =>
            total +
            product.variants.reduce(
              (variantTotal, variant) => variantTotal + variant.images.length,
              0,
            ),
          0,
        ),
        href: '/admin/uploads',
        linkLabel: 'View uploads',
      },
      {
        icon: 'users' as const,
        label: 'Customers',
        value: new Set(orders.map((order) => order.customer.email)).size,
        href: '/admin/customers',
        linkLabel: 'View customers',
      },
    ],
    [orders, products],
  );

  if (status === 'loading') {
    return (
      <EmptyState
        title="Loading admin"
        message="Checking your secure AEVRO admin session."
      />
    );
  }

  if (!user) {
    return <EmptyState title="Login required" message="Redirecting you to login." />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="aevro-container min-h-screen py-12">
        <div className="border border-[#111111] px-6 py-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
            Access denied
          </p>
          <p className="mx-auto max-w-md text-sm leading-6 text-[#5f5a53]">
            This area is reserved for AEVRO administrators.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-flex h-12 items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3]"
          >
            Back to account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <section>
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(480px,0.92fr)] xl:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a56f3c]">
              AEVRO Control
            </p>
            <h1 className="mt-4 font-serif text-5xl font-light leading-none text-[#111111] sm:text-6xl">
              Admin overview
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#625a51]">
              Role-gated admin access is active. The sections below are reserved
              placeholders for future operational tools.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <AdminMetricCard key={metric.label} {...metric} />
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-5 lg:grid-cols-2">
            {adminActions.map((action) => (
              <AdminActionCard key={action.title} {...action} />
            ))}
          </div>

          <aside className="rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-6 shadow-[0_18px_70px_rgba(44,34,24,0.035)]">
            <div className="aspect-[4/3] overflow-hidden bg-[#eee7dd]">
              <img
                src="/images/brand/atelier-rack.webp"
                alt="AEVRO atelier rack"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.32em] text-[#a56f3c]">
              AEVRO
            </p>
            <h2 className="mt-5 font-serif text-3xl font-light leading-tight text-[#111111]">
              Built for style.
              <br />
              Designed for control.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#625a51]">
              A refined admin experience for a premium fashion brand.
            </p>
            <p className="mt-8 font-serif text-4xl italic text-[#6f665b]">
              Aevro
            </p>
          </aside>
        </div>
      </section>
    </AdminLayout>
  );
}
