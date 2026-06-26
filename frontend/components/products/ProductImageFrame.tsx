import type { ProductImage } from '../../types/catalog';

type ProductImageFrameProps = {
  image?: ProductImage;
  productName: string;
  className?: string;
  imageClassName?: string;
};

export function ProductImageFrame({
  image,
  productName,
  className = '',
  imageClassName = 'object-cover',
}: ProductImageFrameProps) {
  return (
    <div className={`overflow-hidden bg-[#eee8de] ${className}`}>
      {image ? (
        <img
          src={image.url}
          alt={image.altText ?? productName}
          className={`h-full w-full transition duration-500 group-hover:scale-[1.02] ${imageClassName}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center border border-[#ddd4c8] bg-[#eee8de] px-6 text-center text-xs uppercase tracking-[0.18em] text-[#777777]">
          AEVRO
        </div>
      )}
    </div>
  );
}
