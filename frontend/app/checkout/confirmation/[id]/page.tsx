import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ErrorState } from '../../../../components/ui/ErrorState';
import { getOrder } from '../../../../lib/api/orders';
import { formatPrice } from '../../../../lib/format';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOrder(id);

  if (!result.success) {
    if (result.statusCode === 404) {
      notFound();
    }

    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8">
        <ErrorState
          title="Order unavailable"
          message="The order could not be loaded. Check that the backend is running and try again."
        />
      </main>
    );
  }

  const order = result.data;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8">
      <div className="border-b border-[#e5e5e5] pb-8">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
          Order created
        </p>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h1 className="text-4xl font-light md:text-5xl">
              Your pending order is ready.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#555555]">
              Use this reference for the next payment step. Razorpay is not
              connected yet, so no payment has been collected.
            </p>
          </div>
          <div className="border border-[#e5e5e5] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">
              Reference
            </p>
            <p className="mt-2 text-lg">{order.orderNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          {order.items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 border-b border-[#e5e5e5] pb-5 sm:grid-cols-[1fr_auto]"
            >
              <div>
                {item.productSlug ? (
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="text-lg underline-offset-4 hover:underline"
                  >
                    {item.productName}
                  </Link>
                ) : (
                  <p className="text-lg">{item.productName}</p>
                )}
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#777777]">
                  Qty {item.quantity}
                  {item.selectedColor ? ` / ${item.selectedColor}` : ''}
                  {item.selectedSize ? ` / ${item.selectedSize}` : ''}
                </p>
              </div>
              <div className="text-sm sm:text-right">
                <p className="text-[#777777]">
                  {formatPrice(item.unitPriceInPaise)} each
                </p>
                <p className="mt-1 font-medium">
                  {formatPrice(item.lineTotalInPaise)}
                </p>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit border border-[#e5e5e5] p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
            Summary
          </p>
          <div className="mt-6 space-y-4 border-b border-[#e5e5e5] pb-5 text-sm">
            <div className="flex justify-between">
              <span>Status</span>
              <span>{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Items</span>
              <span>{order.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatPrice(order.totalInPaise)}</span>
            </div>
          </div>

          <div className="mt-5 text-sm leading-7 text-[#555555]">
            <p>{order.customer.name}</p>
            <p>{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            <p className="mt-4">
              {order.shippingAddress.addressLine}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.postalCode},{' '}
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-white"
            >
              Continue shopping
            </Link>
            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-center border border-[#d9d9d9] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
            >
              View cart
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
