import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSearchQuery, searchTerms } from './search-normalization';

test('normalizes singular and plural trouser queries to the catalog term', () => {
  assert.equal(normalizeSearchQuery('  TROUSERS  '), 'trouser');
  assert.equal(normalizeSearchQuery('pants'), 'trouser');
  assert.equal(normalizeSearchQuery('formal pants'), 'formal trouser');
});

test('normalizes spacing and wide-leg syntax without creating malformed tokens', () => {
  assert.equal(normalizeSearchQuery('  black   wide-leg trousers '), 'black wide leg trouser');
  assert.deepEqual(searchTerms('black trousers'), ['black', 'trouser']);
  assert.equal(normalizeSearchQuery('!!!'), undefined);
  assert.equal(normalizeSearchQuery('   '), undefined);
});

test('limits search input length before it reaches PostgreSQL', () => {
  assert.equal(normalizeSearchQuery('a'.repeat(100))?.length, 80);
});
