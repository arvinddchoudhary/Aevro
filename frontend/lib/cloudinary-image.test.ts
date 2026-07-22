import assert from 'node:assert/strict';
import test from 'node:test';
import { getCloudinaryProductImageUrl } from './cloudinary-image.ts';

const base = 'https://res.cloudinary.com/example-cloud/image/upload';

test('adds responsive delivery transforms to a normal Cloudinary URL', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/products/black.jpg`, {
      delivery: 'product-card',
      width: 640,
    }),
    `${base}/f_auto,q_auto:good,c_limit,w_640/products/black.jpg`,
  );
});

test('preserves versions, file extensions, public IDs, and query parameters', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/v123456789/products/black trouser.webp?download=0`, {
      delivery: 'product-detail',
      width: 1600,
    }),
    `${base}/f_auto,q_auto:good,c_limit,w_1400/v123456789/products/black%20trouser.webp?download=0`,
  );
});

test('preserves a versioned public-ID folder named f_auto', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/v123456789/f_auto/products/black.jpg`, {
      delivery: 'product-card',
      width: 640,
    }),
    `${base}/f_auto,q_auto:good,c_limit,w_640/v123456789/f_auto/products/black.jpg`,
  );
});

test('preserves a versioned public-ID folder named w_300', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/v123456789/w_300/products/black.jpg`, {
      delivery: 'product-card',
      width: 640,
    }),
    `${base}/f_auto,q_auto:good,c_limit,w_640/v123456789/w_300/products/black.jpg`,
  );
});

test('preserves a versioned public-ID folder named q_auto:good', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/v123456789/q_auto:good/products/black.jpg`, {
      delivery: 'product-card',
      width: 640,
    }),
    `${base}/f_auto,q_auto:good,c_limit,w_640/v123456789/q_auto:good/products/black.jpg`,
  );
});

test('works for public IDs without a file extension', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/v123/products/black-trouser`, {
      delivery: 'product-card',
      width: 500,
    }),
    `${base}/f_auto,q_auto:good,c_limit,w_500/v123/products/black-trouser`,
  );
});

test('retains existing crop transformations', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/c_fill,g_auto,w_800/products/black.jpg`, {
      delivery: 'thumbnail',
      width: 280,
    }),
    `${base}/f_auto,q_auto:eco,c_limit,w_280/c_fill,g_auto,w_800/products/black.jpg`,
  );
});

test('replaces a previous helper transform instead of duplicating it', () => {
  const transformed = getCloudinaryProductImageUrl(`${base}/f_auto,q_auto:good,c_limit,w_900/products/black.jpg`, {
    delivery: 'product-card',
    width: 480,
  });

  assert.equal(transformed, `${base}/f_auto,q_auto:good,c_limit,w_480/products/black.jpg`);
  assert.equal((transformed.match(/f_auto/g) ?? []).length, 1);
});

test('does not duplicate format or quality when a crop transform already has them', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/f_auto,q_auto,c_fill,g_auto,w_800/v123/products/black.jpg`, {
      delivery: 'product-card',
      width: 640,
    }),
    `${base}/f_auto,q_auto:good,c_limit,w_640/c_fill,g_auto,w_800/v123/products/black.jpg`,
  );
});

test('preserves ambiguous public-ID folders when a URL has no version marker', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/f_auto/w_300/q_auto:good/c_limit/black.jpg?download=0`, {
      delivery: 'thumbnail',
      width: 80,
    }),
    `${base}/f_auto,q_auto:eco,c_limit,w_80/f_auto/w_300/q_auto:good/c_limit/black.jpg?download=0`,
  );
});

test('uses eco quality and caps thumbnail width', () => {
  assert.match(
    getCloudinaryProductImageUrl(`${base}/products/black.jpg`, { delivery: 'thumbnail', width: 720 }),
    /f_auto,q_auto:eco,c_limit,w_300/,
  );
});

test('caps card and detail widths', () => {
  assert.match(
    getCloudinaryProductImageUrl(`${base}/products/black.jpg`, { delivery: 'product-card', width: 1200 }),
    /w_900/,
  );
  assert.match(
    getCloudinaryProductImageUrl(`${base}/products/black.jpg`, { delivery: 'product-detail', width: 2000 }),
    /w_1400/,
  );
});

test('leaves non-Cloudinary URLs unchanged', () => {
  assert.equal(
    getCloudinaryProductImageUrl('https://example.com/products/black.jpg', {
      delivery: 'product-card',
      width: 640,
    }),
    'https://example.com/products/black.jpg',
  );
});

test('preserves encoded public IDs', () => {
  assert.equal(
    getCloudinaryProductImageUrl(`${base}/products/black%20trouser%20%26%20belt.jpg`, {
      delivery: 'product-card',
      width: 600,
    }),
    `${base}/f_auto,q_auto:good,c_limit,w_600/products/black%20trouser%20%26%20belt.jpg`,
  );
});
