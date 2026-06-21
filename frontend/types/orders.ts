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
    variantId?: string;
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
  payment: {
    id: string;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    provider: 'RAZORPAY';
    amountInPaise: number;
    currency: string;
    paidAt: string | null;
  } | null;
  items: Array<{
    id: string;
    productId: string | null;
    variantId: string | null;
    productName: string;
    productSlug: string | null;
    quantity: number;
    unitPriceInPaise: number;
    lineTotalInPaise: number;
    selectedColor: string | null;
    selectedSize: string | null;
    variant: {
      id: string;
      colorName: string;
      colorSlug: string;
      colorHex: string | null;
      size: string;
      stock: number;
      sku: string | null;
    } | null;
    product: {
      id: string;
      name: string;
      slug: string;
      priceInPaise: number;
      status: string;
      images: Array<{
        id: string;
        url: string;
        altText: string | null;
        sortOrder: number;
      }>;
    } | null;
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

export type OrdersResponse =
  | {
      success: true;
      data: Order[];
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };
