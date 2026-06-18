import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Minus,
  Plus,
  Ruler,
  ArrowRight,
  CheckCircle,
  X,
} from 'lucide-react';
import { useProduct } from '../hooks/useProduct';
import { formatPrice } from '../utils/formatPrice';
import { useCartStore } from '../store/cartStore';
import { ProductPageSkeleton } from '../components/Skeleton';
import ErrorFallback from '../components/ErrorFallback';

function getColorHex(color: string): string {
  if (color === 'charcoal') return '#5c5a57';
  if (color === 'beige') return '#c9b99a';
  return '#1a1a1a';
}

function getColorLabel(color: string): string {
  if (color === 'charcoal') return 'Charcoal grey';
  if (color === 'beige') return 'Beige';
  return 'Black';
}

function getSlugForColor(color: string): string {
  return `wide-leg-pleated-trouser-${color}`;
}

const allColors = ['black', 'charcoal', 'beige'];

const features = [
  'High-rise waist',
  'Double pleat construction',
  'Relaxed wide-leg silhouette',
  'Premium drape fabric',
  'Minimal branding',
];

const sizeGuideRows = [
  { size: '28', waistIn: '28"', waistCm: '71cm' },
  { size: '30', waistIn: '30"', waistCm: '76cm' },
  { size: '32', waistIn: '32"', waistCm: '81cm' },
  { size: '34', waistIn: '34"', waistCm: '86cm' },
];

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const showToast = useCartStore((s) => s.showToast);

  const { data: product, isLoading, isError } = useProduct(slug ?? '');

  const deriveColor = (s: string) => {
    if (s.includes('charcoal')) return 'charcoal';
    if (s.includes('beige')) return 'beige';
    return 'black';
  };

  const isMobile = window.innerWidth < 768;

  const [selectedColor, setSelectedColor] = useState(deriveColor(slug ?? ''));
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Accordion state
  const [isDetailsOpen, setIsDetailsOpen] = useState(!isMobile);
  const [isShippingOpen, setIsShippingOpen] = useState(!isMobile);

  useEffect(() => {
    setSelectedColor(deriveColor(slug ?? ''));
    setSelectedSize(null);
    setSelectedImageIndex(0);
    setQuantity(1);
    setAddedToCart(false);
    if (isMobile) {
      setIsDetailsOpen(false);
      setIsShippingOpen(false);
    }
  }, [slug, isMobile]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSizeGuide(false);
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (isLoading) return <ProductPageSkeleton />;
  if (isError || !product) return <ErrorFallback message="Product not found" />;

  const colorLabel = getColorLabel(selectedColor);
  const colorVariants = product.variants.filter((v) => v.color === selectedColor);
  const availableSizes = [...new Set(colorVariants.map((v) => v.size))].sort();
  const selectedVariant = colorVariants.find((v) => v.size === selectedSize);
  const heroImage = product.images[selectedImageIndex]?.image_url;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: `${product.name} — ${colorLabel}`,
      color: colorLabel,
      size: selectedSize,
      price: product.price,
      quantity,
      imageUrl: product.images[0]?.image_url ?? '',
    });
    setAddedToCart(true);
    openDrawer();
    showToast('Added to cart');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: `${product.name} — ${colorLabel}`,
      color: colorLabel,
      size: selectedSize,
      price: product.price,
      quantity,
      imageUrl: product.images[0]?.image_url ?? '',
    });
    navigate('/checkout');
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((i) => (i + 1) % product.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex(
      (i) => (i - 1 + product.images.length) % product.images.length
    );
  };

  const relatedColors = allColors.filter((c) => c !== selectedColor);

  return (
    <>
      <div className="flex min-h-screen flex-col md:grid md:grid-cols-2 md:gap-0">
        {/* ── Left: Image Gallery ── */}
        <div className="relative w-full md:sticky md:top-16 md:h-[calc(100vh-64px)]">
          {/* Main Image */}
          <div
            className="relative aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-muted md:h-full"
            onClick={() => setIsZoomed(true)}
          >
            {heroImage ? (
              <img
                src={heroImage}
                alt={product.name}
                className="h-full w-full object-cover transition-opacity duration-300"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">
                  Product Image
                </span>
              </div>
            )}

            <div className="absolute bottom-3 right-3 bg-black/40 px-2 py-1 text-[10px] text-white md:hidden">
              {selectedImageIndex + 1} / {product.images.length}
            </div>
          </div>

          {/* Desktop Thumbnail Strip */}
          <div className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-2 md:flex">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImageIndex(i)}
                className={`aspect-[3/4] w-14 cursor-pointer overflow-hidden ${
                  selectedImageIndex === i
                    ? 'ring-1 ring-white'
                    : 'opacity-60 transition-opacity hover:opacity-100'
                }`}
              >
                {img.image_url && (
                  <img src={img.image_url} className="h-full w-full object-cover" alt="" />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Thumbnail Strip */}
          <div className="scrollbar-none flex flex-row gap-2 overflow-x-auto px-4 pb-1 pt-3 md:hidden">
            {product.images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImageIndex(i)}
                className={`aspect-[3/4] w-16 shrink-0 cursor-pointer overflow-hidden bg-muted ${
                  selectedImageIndex === i ? 'ring-1 ring-text' : 'opacity-50'
                }`}
              >
                {img.image_url && (
                  <img src={img.image_url} className="h-full w-full object-cover" alt="" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Product Info ── */}
        <div className="px-4 py-8 md:h-[calc(100vh-64px)] md:overflow-y-auto md:p-12 md:pl-16">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 flex min-h-[44px] cursor-pointer items-center gap-1 bg-transparent p-0 text-[11px] uppercase tracking-[0.1em] text-secondary transition-colors hover:text-text md:mb-8 md:min-h-0"
            style={{ border: 'none' }}
          >
            <ChevronLeft size={14} />
            All products
          </button>

          <h1 className="font-display mb-1 text-3xl font-light text-text md:text-4xl">
            {product.name}
          </h1>
          <p className="mb-4 text-xl text-text md:mb-6 md:text-[22px]">
            {formatPrice(product.price)}
          </p>

          <div className="mb-6 h-px bg-border" />

          {/* ── Color Selector ── */}
          <div className="mb-5 md:mb-6">
            <div className="mb-3 flex justify-between">
              <span className="text-[11px] uppercase tracking-[0.15em]">Colour</span>
              <span className="text-[13px] text-secondary">{colorLabel}</span>
            </div>
            <div className="flex gap-3">
              {allColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => navigate(`/products/${getSlugForColor(color)}`)}
                  className={`h-7 w-7 cursor-pointer rounded-full md:h-8 md:w-8 ${
                    selectedColor === color
                      ? 'border-2 border-text'
                      : 'border-2 border-transparent ring-1 ring-border'
                  }`}
                  style={{ backgroundColor: getColorHex(color) }}
                  aria-label={color}
                />
              ))}
            </div>
          </div>

          {/* ── Size Selector ── */}
          <div className="mb-5 md:mb-6">
            <div className="mb-3 flex justify-between">
              <span className="text-[11px] uppercase tracking-[0.15em]">Size</span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="flex min-h-[44px] cursor-pointer items-center gap-1 bg-transparent p-0 text-[11px] text-secondary transition-colors hover:text-text md:min-h-0"
                style={{ border: 'none' }}
              >
                <Ruler size={12} />
                Size guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const variant = colorVariants.find((v) => v.size === size);
                const outOfStock = !variant || variant.stock === 0;
                const isSelected = selectedSize === size;
                const showLowStock = isSelected && variant && variant.stock > 0 && variant.stock <= 3;

                return (
                  <div key={size} className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      className={`flex h-10 w-12 min-w-[48px] cursor-pointer items-center justify-center text-[13px] transition-all md:h-10 md:w-14 ${
                        outOfStock
                          ? 'cursor-not-allowed bg-muted text-[#ccc] line-through'
                          : isSelected
                            ? 'bg-text text-white'
                            : 'border border-border bg-white text-text hover:border-text'
                      }`}
                      style={outOfStock || isSelected ? { border: 'none' } : undefined}
                    >
                      {size}
                    </button>
                    {showLowStock && (
                      <span className="flex items-center gap-1 text-[10px] text-[#c4a35a]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#c4a35a]" />
                        Only {variant.stock} left
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="mb-8 flex flex-col gap-3 md:block">
            <div className="flex w-full items-center gap-3">
              {/* Quantity */}
              {selectedSize && (
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-12 w-10 cursor-pointer items-center justify-center border border-border bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="flex h-12 w-10 items-center justify-center border-y border-border text-[13px]">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-12 w-10 cursor-pointer items-center justify-center border border-border bg-white"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              {/* Add to cart */}
              <button
                type="button"
                disabled={!selectedSize}
                onClick={handleAddToCart}
                className={`flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-200 ${
                  addedToCart
                    ? 'border border-transparent bg-[#f5f3ef] text-text'
                    : 'border border-text bg-white text-text'
                } ${!selectedSize ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle size={14} /> Added
                  </>
                ) : (
                  'Add to cart'
                )}
              </button>
            </div>

            {/* Buy now */}
            <button
              type="button"
              disabled={!selectedSize}
              onClick={handleBuyNow}
              className={`mt-3 flex min-h-[48px] w-full cursor-pointer items-center justify-center bg-text text-[11px] uppercase tracking-[0.2em] text-white md:mt-4 ${
                !selectedSize ? 'cursor-not-allowed opacity-50' : ''
              }`}
              style={{ border: 'none' }}
            >
              Buy now
              <ArrowRight size={14} className="ml-2" />
            </button>
          </div>

          {/* ── Accordion Details ── */}
          <div className="mt-8 border-t border-border">
            {/* Details */}
            <div className="border-b border-border">
              <div
                className={`flex min-h-[44px] cursor-pointer items-center justify-between py-4 ${
                  !isMobile && 'cursor-default'
                }`}
                onClick={() => isMobile && setIsDetailsOpen(!isDetailsOpen)}
              >
                <h3 className="text-[11px] uppercase tracking-[0.15em]">Details</h3>
                {isMobile && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      isDetailsOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>
              {isDetailsOpen && (
                <div className="pb-6">
                  <p className="text-[13px] leading-[1.9] text-secondary">
                    {product.description}
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    {features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-[13px] text-secondary">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div className="border-b border-border">
              <div
                className={`flex min-h-[44px] cursor-pointer items-center justify-between py-4 ${
                  !isMobile && 'cursor-default'
                }`}
                onClick={() => isMobile && setIsShippingOpen(!isShippingOpen)}
              >
                <h3 className="text-[11px] uppercase tracking-[0.15em]">
                  Shipping &amp; Returns
                </h3>
                {isMobile && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      isShippingOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </div>
              {isShippingOpen && (
                <div className="pb-6">
                  <p className="text-[13px] leading-[1.9] text-secondary">
                    Free shipping on orders above Rs. 999. Standard delivery 3–5 business days. Easy returns within 7 days of delivery. Item must be unworn and in original condition.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      <section className="border-t border-border px-4 py-16 md:px-8">
        <h2 className="font-display mb-8 text-2xl font-light md:text-3xl">
          You may also like
        </h2>
        <div className="grid grid-cols-2 gap-px bg-border">
          {relatedColors.map((color) => {
            const relSlug = getSlugForColor(color);
            return (
              <div
                key={color}
                className="group relative aspect-[3/4] cursor-pointer overflow-hidden bg-muted"
                onClick={() => {
                  navigate(`/products/${relSlug}`);
                  window.scrollTo(0, 0);
                }}
              >
                <div
                  className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3"
                  style={{ backgroundColor: getColorHex(color) }}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#aaa] mix-blend-difference">
                    {getColorLabel(color)}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/50 to-transparent p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-[13px] font-medium tracking-wide">
                    Wide-Leg Pleated Trouser
                  </p>
                  <p className="text-[11px] text-white/80">{getColorLabel(color)}</p>
                  <p className="mt-1 text-[13px]">Rs. 1,899</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Zoom Modal ── */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => setIsZoomed(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
          >
            <X size={20} />
          </button>

          {product.images.length > 1 && (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
              onClick={prevImage}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {heroImage && (
            <img
              src={heroImage}
              alt=""
              className="max-h-screen max-w-full object-contain p-4"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {product.images.length > 1 && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white"
              onClick={nextImage}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}

      {/* ── Size Guide Modal ── */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="w-full max-w-[400px] bg-white p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display mb-6 text-2xl font-light">Size Guide</h2>
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  <th className="py-3 text-left text-[10px] uppercase tracking-[0.2em] text-secondary">
                    Size
                  </th>
                  <th className="py-3 text-left text-[10px] uppercase tracking-[0.2em] text-secondary">
                    Waist (inches)
                  </th>
                  <th className="py-3 text-left text-[10px] uppercase tracking-[0.2em] text-secondary">
                    Waist (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizeGuideRows.map((row) => (
                  <tr
                    key={row.size}
                    className={`border-t border-border ${
                      selectedSize === row.size ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    <td className="py-3 pl-2">{row.size}</td>
                    <td className="py-3">{row.waistIn}</td>
                    <td className="py-3">{row.waistCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-[11px] leading-relaxed text-secondary">
              Measure around your natural waist. If between sizes, size up.
            </p>
            <button
              type="button"
              onClick={() => setShowSizeGuide(false)}
              className="mt-6 flex h-11 w-full cursor-pointer items-center justify-center border border-border bg-white text-[11px] uppercase tracking-[0.15em] transition-colors hover:border-text"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
