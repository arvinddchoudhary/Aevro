import type { PaginationMeta } from '../catalog';
import type { Order } from '../orders';

export type AdminOrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type AdminPaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type AdminOrderSort = 'newest' | 'oldest';

export type AdminOrder = Order & {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
};

export type AdminOrdersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminOrderStatus;
  paymentStatus?: AdminPaymentStatus;
  sort?: AdminOrderSort;
};

export type AdminOrdersResponse =
  | {
      success: true;
      data: AdminOrder[];
      meta: PaginationMeta;
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };

export type AdminOrderResponse =
  | {
      success: true;
      data: AdminOrder;
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };
