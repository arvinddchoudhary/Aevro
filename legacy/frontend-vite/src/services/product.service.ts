import api from './api';
import type { Product } from '../types';

export async function getProducts(filters?: {
  color?: string;
  size?: string;
}): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/products/', { params: filters });
  return data;
}

export async function getProduct(slug: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${slug}`);
  return data;
}
