// ── Product ──

export interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: ProductImage[];
  variants: ProductVariant[];
}

// ── Cart ──

export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// ── Order ──

export interface OrderFormData {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  variant_id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderPayload extends OrderFormData {
  items: OrderItem[];
  total_amount: number;
}

export interface OrderResponse {
  id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  razorpay_order_id: string | null;
  created_at: string;
}

// ── Razorpay ──

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayVerifyPayload extends RazorpayResponse {
  order_id: number;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
}
