import type { Metadata } from 'next';
import { WishlistPageContent } from '../../../components/wishlist/WishlistPageContent';
import { pageMetadata } from '../../../lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'My Wishlist',
  description: 'View and manage your saved AEVRO wishlist pieces.',
  path: '/account/wishlist',
  noIndex: true,
});

export default function AccountWishlistPage() {
  return (
    <main className="min-h-screen">
      <WishlistPageContent />
    </main>
  );
}
