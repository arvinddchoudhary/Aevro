export type RazorpayOrder = {
  keyId: string;
  orderId: string;
  orderNumber: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
};

export type PaymentVerificationPayload = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type Payment = {
  id: string;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  provider: 'RAZORPAY';
  amountInPaise: number;
  currency: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiPaymentResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };
