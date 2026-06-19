import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ProductStatus } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to seed the database');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const trousersCategory = await prisma.category.upsert({
    where: { slug: 'trousers' },
    update: {
      name: 'Trousers',
      description: 'Premium wide-leg and tailored trousers.',
    },
    create: {
      name: 'Trousers',
      slug: 'trousers',
      description: 'Premium wide-leg and tailored trousers.',
    },
  });

  const products = [
    {
      name: 'Wide-Leg Pleated Trouser - Black',
      slug: 'wide-leg-pleated-trouser-black',
      sku: 'AEVRO-WLPT-BLK',
      color: 'Black',
      size: '30',
      stock: 12,
      priceInPaise: 189900,
      description:
        'A high-rise double-pleated wide-leg trouser in premium drape fabric.',
      images: [
        {
          url: '/images/products/product-1.jpg',
          altText: 'AEVRO black wide-leg pleated trouser',
          sortOrder: 0,
        },
      ],
    },
    {
      name: 'Wide-Leg Pleated Trouser - Charcoal',
      slug: 'wide-leg-pleated-trouser-charcoal',
      sku: 'AEVRO-WLPT-CHR',
      color: 'Charcoal',
      size: '32',
      stock: 8,
      priceInPaise: 189900,
      description:
        'A relaxed wide-leg trouser with a clean tailored drape and minimal branding.',
      images: [
        {
          url: '/images/products/product-2.jpg',
          altText: 'AEVRO charcoal wide-leg pleated trouser',
          sortOrder: 0,
        },
      ],
    },
    {
      name: 'Wide-Leg Essential Trouser - Onyx',
      slug: 'wide-leg-essential-trouser-onyx',
      sku: 'AEVRO-WLET-ONX',
      color: 'Onyx',
      size: '34',
      stock: 10,
      priceInPaise: 209900,
      description:
        'A clean wide-leg trouser with an easy fall, soft waistband, and refined everyday silhouette.',
      images: [
        {
          url: '/images/products/product-2.jpg',
          altText: 'AEVRO onyx wide-leg essential trouser',
          sortOrder: 0,
        },
      ],
    },
  ];

  for (const product of products) {
    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        categoryId: trousersCategory.id,
        name: product.name,
        description: product.description,
        priceInPaise: product.priceInPaise,
        sku: product.sku,
        color: product.color,
        size: product.size,
        stock: product.stock,
        status: ProductStatus.ACTIVE,
      },
      create: {
        categoryId: trousersCategory.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        priceInPaise: product.priceInPaise,
        sku: product.sku,
        color: product.color,
        size: product.size,
        stock: product.stock,
        status: ProductStatus.ACTIVE,
      },
    });

    await prisma.productImage.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prisma.productImage.createMany({
      data: product.images.map((image) => ({
        productId: savedProduct.id,
        ...image,
      })),
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
