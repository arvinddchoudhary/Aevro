import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../services/product.service';
import type { Product } from '../types';

export function useProduct(slug: string) {
  return useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!slug,
  });
}
