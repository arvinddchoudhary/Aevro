export type CreateOrderPayload = {
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

export type Order = {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalInPaise: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    productSlug: string | null;
    quantity: number;
    unitPriceInPaise: number;
    lineTotalInPaise: number;
    selectedColor: string | null;
    selectedSize: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type OrderResponse =
  | {
      success: true;
      data: Order;
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };
