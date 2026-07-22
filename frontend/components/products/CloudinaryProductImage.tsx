import Image from 'next/image';
import {
  createCloudinaryProductImageLoader,
  type CloudinaryImageDelivery,
} from '../../lib/cloudinary-image';

type CloudinaryProductImageProps = {
  src: string;
  alt: string;
  delivery: CloudinaryImageDelivery;
  sizes: string;
  className?: string;
  preload?: boolean;
  loading?: 'eager' | 'lazy';
};

/** Storefront product image with Cloudinary delivery transforms and Next layout support. */
export function CloudinaryProductImage({
  src,
  alt,
  delivery,
  sizes,
  className,
  preload = false,
  loading = 'lazy',
}: CloudinaryProductImageProps) {
  return (
    <Image
      fill
      src={src}
      alt={alt}
      sizes={sizes}
      loader={createCloudinaryProductImageLoader(delivery)}
      preload={preload}
      loading={preload ? undefined : loading}
      className={className}
    />
  );
}
