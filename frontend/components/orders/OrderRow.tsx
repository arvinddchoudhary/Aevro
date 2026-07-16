import Link from 'next/link';
import { AccountIcon } from '../account/AccountIcons';
import { formatPrice } from '../../lib/format';
import type { Order } from '../../types/orders';

type OrderRowProps = {
  order: Order;
};

const orderStatusStyles: Record<Order['status'], string> = {
  PENDING: 'bg-[#eee5da] text-[#625a51]',
  CONFIRMED: 'bg-[#e8edf2] text-[#3f5264]',
  PROCESSING: 'bg-[#eee5da] text-[#625a51]',
  SHIPPED: 'bg-[#f3ead8] text-[#7b6238]',
  DELIVERED: 'bg-[#e7ecdf] text-[#536544]',
  CANCELLED: 'bg-[#ede8e5] text-[#74645d]',
};

const paymentStatusStyles = {
  PAID: 'text-[#3f7a39]',
  PENDING: 'text-[#7b6238]',
  FAILED: 'text-[#8a1f1f]',
  REFUNDED: 'text-[#4f5f75]',
  UNPAID: 'text-[#74645d]',
} as const;

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function displayStatus(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function orderImages(order: Order) {
  return order.items
    .map((item) => ({
      alt: item.product?.images[0]?.altText ?? item.productName,
      url: item.product?.images[0]?.url,
    }))
    .filter((image): image is { alt: string; url: string } => Boolean(image.url))
    .slice(0, 3);
}

export function OrderRow({ order }: OrderRowProps) {
  const images = orderImages(order);
  const hiddenItemCount = Math.max(order.items.length - images.length, 0);
  const paymentStatus = order.payment?.status ?? 'UNPAID';
  const paymentClass =
    paymentStatusStyles[paymentStatus as keyof typeof paymentStatusStyles] ??
    paymentStatusStyles.UNPAID;

  return (
    <article className="border border-[#e1d8cc] bg-[#fffaf3]/80 p-3 transition hover:border-[#cfc1b1] sm:p-5">
      <div className="grid gap-4 sm:gap-5 min-[1500px]:grid-cols-[180px_minmax(160px,1fr)_90px_100px_110px_150px_20px] min-[1500px]:items-center min-[1500px]:gap-4">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 min-[1500px]:pb-0">
          {images.length > 0 ? (
            images.map((image) => (
              <span
                key={`${order.id}-${image.url}`}
                className="block h-14 w-14 shrink-0 overflow-hidden bg-[#eee5da] sm:h-16 sm:w-16"
              >
                <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
              </span>
            ))
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-[#eee5da] text-[#7f7468]">
              <AccountIcon name="bag" className="h-7 w-7" />
            </span>
          )}
          {hiddenItemCount > 0 && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#111111] px-2 text-xs font-semibold text-[#fffaf3]">
              {hiddenItemCount}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="break-words text-base text-[#111111] sm:truncate sm:text-lg">
            Order {order.orderNumber}
          </h3>
          <p className="mt-1 text-sm text-[#625a51]">{formatOrderDate(order.createdAt)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 min-[1500px]:contents">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#777067]">
              Total
            </p>
            <p className="mt-1 text-sm font-medium text-[#111111]">
              {formatPrice(order.totalInPaise)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#777067]">
              Payment
            </p>
            <p className={`mt-1 flex items-center gap-2 text-sm ${paymentClass}`}>
              <span
                className="h-1.5 w-1.5 rounded-full bg-current"
                aria-hidden="true"
              />
              {displayStatus(paymentStatus)}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#777067]">
              Status
            </p>
            <span
              className={`mt-1 inline-flex px-3 py-1 text-xs ${orderStatusStyles[order.status]}`}
            >
              {displayStatus(order.status)}
            </span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 min-[1500px]:grid-cols-1">
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex h-10 items-center justify-center whitespace-nowrap bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924]"
            style={{ color: '#fffaf3' }}
          >
            View Order
          </Link>
          <button
            type="button"
            disabled
            title="Tracking is not available yet"
            className="inline-flex h-10 cursor-not-allowed items-center justify-center whitespace-nowrap border border-[#ddd4c8] px-5 text-xs font-medium uppercase tracking-[0.08em] text-[#8a8177]"
          >
            Track Package
          </button>
        </div>

        <AccountIcon
          name="chevron"
          className="hidden h-5 w-5 text-[#111111] min-[1500px]:block"
        />
      </div>
    </article>
  );
}
