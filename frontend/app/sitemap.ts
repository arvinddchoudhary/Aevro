import type { MetadataRoute } from 'next';
import { getProducts } from '../lib/api/catalog';
import { absoluteUrl } from '../lib/seo';

const staticPublicRoutes = ['/', '/products', '/about', '/lookbook'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = staticPublicRoutes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === '/' || route === '/products' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.8,
  })) satisfies MetadataRoute.Sitemap;

  try {
    const products = await getProducts({
      status: 'ACTIVE',
      limit: 100,
      sort: 'newest',
    });

    const productEntries = products.data.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: new Date(product.updatedAt ?? product.createdAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    })) satisfies MetadataRoute.Sitemap;

    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
