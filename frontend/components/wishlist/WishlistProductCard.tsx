'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AccountIcon } from '../account/AccountIcons';
import { useCart } from '../../lib/cart';
import { formatPrice } from '../../lib/format';
import type { WishlistItem } from '../../types/wishlist';

type WishlistProductCardProps = {
  item: WishlistItem;
  layout: 'grid' | 'list';
  onRemove: (item: WishlistItem) => void;
  onMessage: (message: string) => void;
};

function productImage(item: WishlistItem) {
  return item.product.primaryImage ?? item.product.images[0] ?? null;
}

export function WishlistProductCard({
  item,
  layout,
  onMessage,
  onRemove,
}: WishlistProductCardProps) {
  const router = useRouter();
  const { addProduct } = useCart();
  const image = productImage(item);
  const selectedVariant = item.selectedVariant;
  const selectedImage =
    selectedVariant?.images.find((variantImage) => variantImage.isPrimary) ??
    selectedVariant?.images[0] ??
    image;
  const subtitle =
    selectedVariant?.colorName ??
    item.product.color ??
    item.product.category?.name ??
    'AEVRO';

  const moveToBag = () => {
    if (selectedVariant) {
      const wasAdded = addProduct(
        item.product,
        {
          variantId: selectedVariant.id,
          selectedColor: selectedVariant.colorName,
          selectedSize: selectedVariant.size,
          stock: selectedVariant.stock,
          imageUrl: selectedImage?.url,
          imageAltText: selectedImage?.altText,
        },
        1,
      );

      onMessage(wasAdded ? 'Added to bag.' : 'This item is currently unavailable.');
      return;
    }

    if (!item.product.variants?.length && item.product.stock > 0) {
      const wasAdded = addProduct(item.product, undefined, 1);
      onMessage(wasAdded ? 'Added to bag.' : 'This item is currently unavailable.');
      return;
    }

    onMessage('Select size before adding to bag.');
    router.push(`/products/${item.product.slug}`);
  };

  return (
    <article
      className={`min-w-0 border border-[#e1d8cc] bg-[#fffaf3]/82 p-2.5 transition hover:border-[#cfc1b1] sm:p-3 ${
        layout === 'list' ? 'grid gap-4 sm:grid-cols-[180px_1fr]' : ''
      }`}
    >
      <div className="relative overflow-hidden bg-[#eee5da]">
        <Link href={`/products/${item.product.slug}`} className="block">
          <div className={layout === 'list' ? 'aspect-[4/5]' : 'aspect-[3/4]'}>
            {image ? (
              <img
                src={image.url}
                alt={image.altText ?? item.product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[#7f7468]">
                <AccountIcon name="bag" className="h-9 w-9" />
              </span>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={() => onRemove(item)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd4c8] bg-[#fffaf3]/92 text-[#d21f1f] transition hover:bg-white"
          aria-label={`Remove ${item.product.name} from wishlist`}
        >
          <AccountIcon name="heart" className="h-5 w-5 fill-current" />
        </button>
      </div>

      <div className="pt-3 sm:pt-4">
        <Link
          href={`/products/${item.product.slug}`}
          className="line-clamp-2 block text-xs font-medium leading-5 text-[#111111] underline-offset-4 hover:underline sm:text-sm"
        >
          {item.product.name}
        </Link>
        <p className="mt-1.5 truncate text-xs text-[#777067] sm:mt-2">{subtitle}</p>
        <p className="mt-2 text-sm font-semibold sm:mt-3">{formatPrice(item.product.priceInPaise)}</p>

        <div className="mt-3 grid gap-2 sm:mt-4">
          <button
            type="button"
            onClick={moveToBag}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 border border-[#ddd4c8] px-2 text-[0.64rem] font-medium uppercase tracking-[0.06em] transition hover:border-[#111111] sm:gap-2 sm:px-4 sm:text-xs sm:tracking-[0.08em]"
          >
            <AccountIcon name="bag" className="h-4 w-4" />
            Move to Bag
          </button>
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="inline-flex h-9 items-center justify-center gap-1.5 text-xs text-[#625a51] transition hover:text-[#111111] sm:gap-2"
          >
            <AccountIcon name="delete" className="h-4 w-4" />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
