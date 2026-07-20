import assert from 'node:assert/strict';
import test from 'node:test';
import { recommendPackage, validateReviewedPackage } from '../package-recommendation';

test('recommends the approved package rules for quantities one through four', () => {
  assert.deepEqual(recommendPackage(1), { packageType: 'SMALL', weightKg: 0.7, lengthCm: 40, breadthCm: 38, heightCm: 3, requiresManualDetails: false });
  assert.deepEqual(recommendPackage(2), { packageType: 'SMALL', weightKg: 1.2, lengthCm: 40, breadthCm: 38, heightCm: 3, requiresManualDetails: false });
  assert.deepEqual(recommendPackage(3), { packageType: 'LARGE', weightKg: 1.4, lengthCm: 40, breadthCm: 38, heightCm: 6, requiresManualDetails: false });
  assert.deepEqual(recommendPackage(4), { packageType: 'LARGE', weightKg: 1.9, lengthCm: 40, breadthCm: 38, heightCm: 6, requiresManualDetails: false });
});

test('requires manual details above four total items', () => {
  assert.deepEqual(recommendPackage(5), { packageType: 'MANUAL', weightKg: null, lengthCm: null, breadthCm: null, heightCm: null, requiresManualDetails: true });
});

test('validates admin-measured overrides within shipment limits', () => {
  assert.equal(validateReviewedPackage({ packageType: 'SMALL', weightKg: 1.28, lengthCm: 42, breadthCm: 38, heightCm: 4 }), null);
});

test('rejects zero, negative, non-finite, and excessive package values', () => {
  assert.match(validateReviewedPackage({ packageType: 'SMALL', weightKg: 0, lengthCm: 40, breadthCm: 38, heightCm: 3 }) ?? '', /Weight/);
  assert.match(validateReviewedPackage({ packageType: 'SMALL', weightKg: 1, lengthCm: -1, breadthCm: 38, heightCm: 3 }) ?? '', /Length/);
  assert.match(validateReviewedPackage({ packageType: 'SMALL', weightKg: 1, lengthCm: 40, breadthCm: Number.POSITIVE_INFINITY, heightCm: 3 }) ?? '', /Breadth/);
  assert.match(validateReviewedPackage({ packageType: 'SMALL', weightKg: 31, lengthCm: 40, breadthCm: 38, heightCm: 3 }) ?? '', /Weight/);
});
