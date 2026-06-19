import api from './api';
import type { CreateOrderPayload, OrderResponse, RazorpayVerifyPayload } from '../types';

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  const { data } = await api.post<OrderResponse>('/orders/', payload);
  return data;
}

export async function getOrder(id: number): Promise<OrderResponse> {
  const { data } = await api.get<OrderResponse>(`/orders/${id}`);
  return data;
}

export async function createRazorpayOrder(
  orderId: number,
  amount: number,
): Promise<{ razorpay_order_id: string; amount: number; currency: string; key_id: string }> {
  const { data } = await api.post('/payments/create-order', {
    order_id: orderId,
    amount,
  });
  return data;
}

export async function verifyPayment(payload: RazorpayVerifyPayload): Promise<{
  success: boolean;
  order_id: number;
  order_number: string;
}> {
  const { data } = await api.post('/payments/verify', payload);
  return data;
}
