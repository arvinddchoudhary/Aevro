import type { AdminOrderStatus, AdminPaymentStatus } from '../../types/admin/orders';

const orderStyles: Record<AdminOrderStatus, string> = {
  PENDING: 'border-[#ead8bf] bg-[#fff7ea] text-[#7a5532]',
  CONFIRMED: 'border-[#ddd4c8] bg-[#f7f1e8] text-[#514c45]',
  PROCESSING: 'border-[#dfd2bf] bg-[#f1eadf] text-[#514c45]',
  SHIPPED: 'border-[#d7dde0] bg-[#eef2f2] text-[#42515a]',
  DELIVERED: 'border-[#d7e8cf] bg-[#eef8e8] text-[#3d6333]',
  CANCELLED: 'border-[#e2d3d0] bg-[#f4eeee] text-[#7b3a34]',
};

const paymentStyles: Record<AdminPaymentStatus, string> = {
  PENDING: 'border-[#ead8bf] bg-[#fff7ea] text-[#7a5532]',
  PAID: 'border-[#d7e8cf] bg-[#eef8e8] text-[#3d6333]',
  FAILED: 'border-[#e2d3d0] bg-[#f4eeee] text-[#7b3a34]',
  REFUNDED: 'border-[#d7dde0] bg-[#eef2f2] text-[#42515a]',
};

export function AdminOrderStatusBadge({ status }: { status: AdminOrderStatus }) {
  return (
    <span className={`inline-flex h-8 items-center rounded-[4px] border px-3 text-[0.68rem] font-medium uppercase tracking-[0.16em] ${orderStyles[status]}`}>
      {status}
    </span>
  );
}

export function AdminPaymentStatusBadge({
  status,
}: {
  status?: AdminPaymentStatus | null;
}) {
  if (!status) {
    return (
      <span className="inline-flex h-8 items-center rounded-[4px] border border-[#ddd4c8] bg-[#f7f1e8] px-3 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[#625a51]">
        No payment
      </span>
    );
  }

  return (
    <span className={`inline-flex h-8 items-center rounded-[4px] border px-3 text-[0.68rem] font-medium uppercase tracking-[0.16em] ${paymentStyles[status]}`}>
      {status}
    </span>
  );
}
