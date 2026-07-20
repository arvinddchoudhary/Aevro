import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { AdminProductsService } from './admin-products.service';

function product(id: string, displayOrder: number) {
  return {
    id,
    name: `Product ${id}`,
    slug: `product-${id}`,
    description: null,
    priceInPaise: 100000,
    status: ProductStatus.ACTIVE,
    category: null,
    stock: 2,
    displayOrder,
    createdAt: new Date(`2026-01-0${displayOrder + 1}T00:00:00.000Z`),
    updatedAt: new Date(),
    variants: [],
    images: [],
  };
}

function createService(ids = ['one', 'two', 'three']) {
  const products = ids.map((id, index) => product(id, index));
  const prisma = {
    product: {
      findMany: async (args?: { select?: { id: boolean } }) =>
        args?.select
          ? products.map(({ id }) => ({ id }))
          : [...products].sort((left, right) => left.displayOrder - right.displayOrder),
      update: async ({ where, data }: { where: { id: string }; data: { displayOrder: number } }) => {
        const current = products.find((candidate) => candidate.id === where.id);
        assert.ok(current);
        current.displayOrder = data.displayOrder;
        return current;
      },
    },
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => callback(prisma),
  };

  return {
    products,
    service: new AdminProductsService(prisma as never, {} as never),
  };
}

test('stores the complete admin product arrangement as sequential display positions', async () => {
  const fixture = createService();

  const result = await fixture.service.reorderProducts({
    productIds: ['three', 'one', 'two'],
  });

  assert.deepEqual(
    fixture.products.map((item) => [item.id, item.displayOrder]),
    [['one', 1], ['two', 2], ['three', 0]],
  );
  assert.deepEqual(result.map((item) => item.id), ['three', 'one', 'two']);
});

test('rejects duplicate, missing, or unknown products in an admin catalog arrangement', async () => {
  const fixture = createService();

  await assert.rejects(
    () => fixture.service.reorderProducts({ productIds: ['one', 'one', 'two'] }),
    (error: unknown) => error instanceof BadRequestException,
  );
  await assert.rejects(
    () => fixture.service.reorderProducts({ productIds: ['one', 'two'] }),
    (error: unknown) => error instanceof BadRequestException,
  );
  await assert.rejects(
    () => fixture.service.reorderProducts({ productIds: ['one', 'two', 'missing'] }),
    (error: unknown) => error instanceof BadRequestException,
  );
});
