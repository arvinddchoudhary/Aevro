import Link from 'next/link';
import { AccountIcon } from '../account/AccountIcons';
import { formatPrice } from '../../lib/format';
import type { Order } from '../../types/orders';
import { CloudinaryProductImage } from '../products/CloudinaryProductImage';

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
    .slice(0, 1);
}

export function OrderRow({ order }: OrderRowProps) {
  const images = orderImages(order);
  const hiddenItemCount = Math.max(order.items.length - 1, 0);
  const paymentStatus = order.payment?.status ?? 'UNPAID';
  const paymentClass =
    paymentStatusStyles[paymentStatus as keyof typeof paymentStatusStyles] ??
    paymentStatusStyles.UNPAID;

  return (
    <article className="border-b border-[#e1d8cc] bg-[#fffdf8] p-4 transition last:border-b-0 hover:bg-[#fffaf3] sm:p-5">
      <div className="grid gap-4 min-[1440px]:grid-cols-[72px_minmax(180px,1fr)_90px_100px_110px_140px_44px] min-[1440px]:items-center min-[1440px]:gap-4">
        <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-4 min-[1440px]:contents">
          <div className="relative h-[76px] w-[72px] overflow-hidden bg-[#eee5da]">
            {images.length > 0 ? (
              <CloudinaryProductImage
                src={images[0].url}
                alt={images[0].alt}
                delivery="thumbnail"
                sizes="72px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[#7f7468]">
                <AccountIcon name="bag" className="h-7 w-7" />
              </span>
            )}
            {hiddenItemCount > 0 && (
              <span className="absolute bottom-1 right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#111111] px-1.5 text-[10px] font-semibold text-[#fffaf3]">
                +{hiddenItemCount}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg text-[#111111]">
              Order {order.orderNumber}
            </h3>
            <p className="mt-1 text-sm text-[#625a51]">
              {formatOrderDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 min-[390px]:grid-cols-3 min-[1440px]:contents">
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

        <div className="grid grid-cols-[minmax(0,1fr)_44px] gap-2 min-[1440px]:contents">
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex h-11 items-center justify-center whitespace-nowrap bg-[#111111] px-5 font-serif text-sm text-[#fffaf3] transition hover:bg-[#2d2924]"
            style={{ color: '#fffaf3' }}
          >
            View Order
          </Link>
          <Link
            href={`/account/orders/${order.id}`}
            aria-label={`View order ${order.orderNumber}`}
            className="inline-flex h-11 w-11 items-center justify-center border border-[#ddd4c8] bg-[#fffdf8] text-[#111111] transition hover:border-[#111111]"
          >
            <AccountIcon name="chevron" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
