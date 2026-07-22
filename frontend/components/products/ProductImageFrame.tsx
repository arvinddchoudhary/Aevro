import type { ProductImage } from '../../types/catalog';
import type { CloudinaryImageDelivery } from '../../lib/cloudinary-image';
import { CloudinaryProductImage } from './CloudinaryProductImage';

type ProductImageFrameProps = {
  image?: ProductImage;
  productName: string;
  className?: string;
  imageClassName?: string;
  delivery?: CloudinaryImageDelivery;
  sizes?: string;
  preload?: boolean;
  loading?: 'eager' | 'lazy';
};

export function ProductImageFrame({
  image,
  productName,
  className = '',
  imageClassName = 'object-cover',
  delivery = 'product-card',
  sizes = '100vw',
  preload = false,
  loading = 'lazy',
}: ProductImageFrameProps) {
  return (
    <div className={`relative overflow-hidden bg-[#eee8de] ${className}`}>
      {image ? (
        <CloudinaryProductImage
          src={image.url}
          alt={image.altText ?? productName}
          delivery={delivery}
          sizes={sizes}
          preload={preload}
          loading={loading}
          className={`transition duration-500 group-hover:scale-[1.02] ${imageClassName}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-[#ddd4c8] bg-[#eee8de] px-6 text-center text-xs uppercase tracking-[0.18em] text-[#777777]">
          AEVRO
        </div>
      )}
    </div>
  );
}
