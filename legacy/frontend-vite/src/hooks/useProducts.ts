import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../services/product.service';
import type { Product } from '../types';

export function useProducts(filters?: { color?: string; size?: string }) {
  return useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
