import assert from 'node:assert/strict';
import test from 'node:test';
import { ShiprocketService } from './shiprocket.service';

function createService() {
  const serviceabilityQueries: Array<Record<string, string | number>> = [];
  const prisma = {
    product: {
      findMany: async () => [
        {
          id: 'product-1',
          priceInPaise: 179900,
          stock: 10,
          variants: [{ id: 'variant-1', stock: 10 }],
        },
      ],
    },
  };
  const config = {
    get: <T>(key: string, fallback?: T) => {
      const values: Record<string, unknown> = {
        SHIPROCKET_ENABLED: true,
        SHIPROCKET_EMAIL: 'configured@example.test',
        SHIPROCKET_PASSWORD: 'configured',
        SHIPROCKET_PICKUP_LOCATION: 'AEVRO Warehouse',
      };
      return (values[key] ?? fallback) as T;
    },
  };
  const client = {
    getPickupLocations: async () => ({
      shipping_address: [{ pickup_location: 'AEVRO Warehouse', pin_code: '500001', is_active: true }],
    }),
    getServiceability: async (query: Record<string, string | number>) => {
      serviceabilityQueries.push(query);
      return {
        data: {
          available_courier_companies: [
            {
              courier_company_id: 1,
              courier_name: 'Example Courier',
              estimated_delivery_days: 3,
            },
          ],
        },
      };
    },
  };

  return {
    service: new ShiprocketService(prisma as never, config as never, client as never, {} as never),
    serviceabilityQueries,
  };
}

test('uses the central package recommendation for a checkout delivery estimate', async () => {
  const { service, serviceabilityQueries } = createService();

  const result = await service.getCheckoutDeliveryEstimate(
    {
      postalCode: '533344',
      items: [{ productId: 'product-1', variantId: 'variant-1', quantity: 2 }],
    },
    '127.0.0.1',
  );

  assert.equal(result.source, 'SHIPROCKET');
  assert.equal(result.message, 'Estimated delivery in 3 business days.');
  assert.deepEqual(serviceabilityQueries, [
    {
      pickup_postcode: '500001',
      delivery_postcode: '533344',
      cod: 0,
      weight: 1.2,
      length: 40,
      breadth: 38,
      height: 3,
      declared_value: 3598,
    },
  ]);
});

test('does not call Shiprocket for checkout carts above four items', async () => {
  const { service, serviceabilityQueries } = createService();

  const result = await service.getCheckoutDeliveryEstimate(
    {
      postalCode: '533344',
      items: [{ productId: 'product-1', variantId: 'variant-1', quantity: 5 }],
    },
    '127.0.0.1',
  );

  assert.equal(result.source, 'STANDARD');
  assert.equal(result.message, 'Estimated delivery: 7–10 business days.');
  assert.deepEqual(serviceabilityQueries, []);
});
