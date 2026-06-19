'use client';

import { ErrorState } from '../../components/ui/ErrorState';

export default function ProductsError() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8">
      <ErrorState
        title="Products unavailable"
        message="Something went wrong while loading products."
      />
    </main>
  );
}
