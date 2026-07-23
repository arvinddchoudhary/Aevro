import assert from 'node:assert/strict';
import test from 'node:test';
import { extractIndianAddress } from './location.service';

test('extracts a safe Indian delivery region from Google address components', () => {
  assert.deepEqual(
    extractIndianAddress({
      results: [
        {
          address_components: [
            { long_name: '500001', types: ['postal_code'] },
            { long_name: 'Hyderabad', types: ['locality', 'political'] },
            { long_name: 'Telangana', types: ['administrative_area_level_1', 'political'] },
            { long_name: 'India', short_name: 'IN', types: ['country', 'political'] },
          ],
        },
      ],
    }),
    {
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500001',
      country: 'India',
    },
  );
});

test('rejects incomplete or non-Indian location results', () => {
  assert.equal(extractIndianAddress({ results: [] }), null);
  assert.equal(
    extractIndianAddress({
      results: [
        {
          address_components: [
            { long_name: '10001', types: ['postal_code'] },
            { long_name: 'New York', types: ['locality'] },
            { long_name: 'New York', types: ['administrative_area_level_1'] },
            { long_name: 'United States', short_name: 'US', types: ['country'] },
          ],
        },
      ],
    }),
    null,
  );
});
