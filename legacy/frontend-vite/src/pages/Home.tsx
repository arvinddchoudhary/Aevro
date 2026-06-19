import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Camera } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/formatPrice';
import type { Product } from '../types';
import { ProductGridSkeleton } from '../components/Skeleton';
import ErrorFallback from '../components/ErrorFallback';

const sizes = ['28', '30', '32', '34'];

const brandStripItems = [
  'Free Delivery Above Rs. 999',
  'Premium Fabric',
  'Minimal Branding',
  'Easy Returns',
  'Razorpay Secured',
];

const philosophyDetails = [
  {
    label: '01',
    title: 'Double pleat',
    desc: 'Traditional tailoring that creates natural drape and ease of movement.',
  },
  {
    label: '02',
    title: 'High rise waist',
    desc: 'Elongates the silhouette. Sits comfortably without a belt.',
  },
  {
    label: '03',
    title: 'Relaxed leg',
    desc: 'Wide enough for confidence, structured enough for intention.',
  },
  {
    label: '04',
    title: 'Premium fabric',
    desc: 'Selected for hand feel, weight, and resistance to creasing.',
  },
];

const highlights = [
  {
    num: '01',
    title: 'Cut first',
    desc: 'Every design decision is made for how the trouser hangs on a moving body — not how it photographs on a hanger.',
  },
  {
    num: '02',
    title: 'No noise',
    desc: 'No visible branding. No seasonal drops. One product, done right, available in three neutral tones.',
  },
  {
    num: '03',
    title: 'Direct price',
    desc: 'No retailer markup. Premium quality at an honest price because we sell only to you, directly.',
  },
  {
    num: '04',
    title: 'Easy returns',
    desc: "If the fit isn't right, we'll sort it. No questions, no complicated process.",
  },
];

const instaColors = ['#f0ece5', '#e8e4db', '#ddd8cf', '#e8e4db', '#f0ece5'];

/* ── Helpers ── */

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Wide-Leg Pleated Trouser",
    slug: "wide-leg-pleated-trouser-black",
    description: "",
    price: 189900,
    images: [],
    variants: [
      { id: 1, product_id: 1, color: "black", size: "28", stock: 4 },
      { id: 2, product_id: 1, color: "black", size: "30", stock: 8 },
      { id: 3, product_id: 1, color: "black", size: "32", stock: 10 },
      { id: 4, product_id: 1, color: "black", size: "34", stock: 6 },
    ]
  },
  {
    id: 2,
    name: "Wide-Leg Pleated Trouser",
    slug: "wide-leg-pleated-trouser-charcoal",
    description: "",
    price: 189900,
    images: [],
    variants: [
      { id: 5, product_id: 2, color: "charcoal", size: "28", stock: 4 },
      { id: 6, product_id: 2, color: "charcoal", size: "30", stock: 8 },
      { id: 7, product_id: 2, color: "charcoal", size: "32", stock: 10 },
      { id: 8, product_id: 2, color: "charcoal", size: "34", stock: 0 },
    ]
  },
  {
    id: 3,
    name: "Wide-Leg Pleated Trouser",
    slug: "wide-leg-pleated-trouser-beige",
    description: "",
    price: 189900,
    images: [],
    variants: [
      { id: 9, product_id: 3, color: "beige", size: "28", stock: 4 },
      { id: 10, product_id: 3, color: "beige", size: "30", stock: 8 },
      { id: 11, product_id: 3, color: "beige", size: "32", stock: 10 },
      { id: 12, product_id: 3, color: "beige", size: "34", stock: 6 },
    ]
  }
];

const getColorInfo = (slug: string) => {
  if (slug.includes('black')) return { hex: '#1a1a1a', label: 'Black', bg: '#e8e6e3' };
  if (slug.includes('charcoal')) return { hex: '#5c5a57', label: 'Charcoal Grey', bg: '#dedad4' };
  if (slug.includes('beige')) return { hex: '#c9b99a', label: 'Beige', bg: '#ede8df' };
  return { hex: '#111', label: 'Black', bg: '#e8e6e3' };
};

/* ── Product Card ── */
function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const showToast = useCartStore((s) => s.showToast);

  const colorInfo = getColorInfo(product.slug);
  const heroImage = product.images[0]?.image_url;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const variant = product.variants.find((v) => v.stock > 0);
    if (!variant) return;
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      color: variant.color,
      size: variant.size,
      price: product.price,
      quantity: 1,
      imageUrl: heroImage || '',
    });
    openDrawer();
    showToast('Added to cart');
  };

  return (
    <div>
      <div
        className="group relative aspect-[2/3] cursor-pointer overflow-hidden"
        style={{ backgroundColor: colorInfo.bg }}
        onClick={() => navigate(`/products/${product.slug}`)}
      >
        {heroImage ? (
          <img
            src={heroImage}
            alt={product.name}
            className="relative z-[1] h-full w-full object-cover"
          />
        ) : (
          <div className="relative z-[1] flex h-full flex-col items-center justify-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#aaa]">
              {colorInfo.label}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 z-[2] translate-y-2 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full cursor-pointer border-none bg-white/90 py-3 text-[10px] uppercase tracking-[0.15em] text-text backdrop-blur-sm md:py-2.5"
          >
            Quick add
          </button>
        </div>
      </div>

      <div className="px-0">
        <p className="mt-3 text-[13px] font-normal tracking-wide">
          {product.name}
        </p>
        <p className="mt-0.5 text-[11px] text-secondary">
          {colorInfo.label}
        </p>
        <p className="mt-1 text-[13px] text-text">
          {formatPrice(product.price)}
        </p>
        <div className="mt-2 flex gap-2">
          {sizes.map((s) => {
            const variant = product.variants.find((v) => v.size === s);
            const oos = !variant || variant.stock === 0;
            return (
              <span
                key={s}
                className={`border border-[#ddd] px-1.5 py-0.5 text-[10px] ${
                  oos ? 'text-[#ccc] line-through opacity-40' : 'text-[#999]'
                }`}
              >
                {s}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Home Page ── */

export default function Home() {
  const navigate = useNavigate();
  const { data: apiProducts, isLoading, isError } = useProducts();

  const products = (apiProducts && apiProducts.length > 0) 
    ? apiProducts 
    : FALLBACK_PRODUCTS;

  return (
    <>
      {/* ────────────────────────── SECTION 1 — Hero ────────────────────────── */}
      <section className="relative h-[70vh] w-full overflow-hidden md:h-screen">
        <div className="absolute inset-0 bg-[#d4cfc6]">
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#999]">
              Campaign Image — 1920×1080
            </span>
          </div>
        </div>

        <div
          className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)' }}
        />

        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-6 pb-10 md:px-12 md:pb-16">
          {/* Left side */}
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-white/70">
              New Collection — 2025
            </p>
            <h1 className="font-display text-[42px] font-light leading-[1.05] text-white md:text-[64px]">
              Wide-leg
              <br />
              <span className="italic">pleated</span>
              <br />
              trousers.
            </h1>
            <button
              type="button"
              onClick={() => navigate('/products/wide-leg-pleated-trouser-black')}
              className="mt-8 flex cursor-pointer items-center justify-center gap-3 bg-white px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] text-text transition-colors duration-300 hover:bg-text hover:text-white md:px-8 md:py-3.5"
              style={{ border: 'none' }}
            >
              Shop now
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Right side */}
          <div className="hidden flex-col items-end gap-8 text-right text-white md:flex">
            <div>
              <p className="font-display text-4xl font-light">Rs. 1,899</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/60">Starting price</p>
            </div>
            <div>
              <p className="font-display text-4xl font-light">3</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/60">Colourways</p>
            </div>
            <div>
              <p className="font-display text-4xl font-light">4</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/60">Sizes</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 animate-bounce">
          <ChevronDown size={20} className="text-white/50" />
        </div>
      </section>

      {/* ────────────────────────── SECTION 2 — Brand Strip ────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-4 border-b border-border px-4 py-4 md:flex-nowrap md:gap-8 md:px-8">
        {brandStripItems.map((item, i) => {
          const isHiddenOnMobile = item === 'Minimal Branding' || item === 'Easy Returns';
          return (
            <div key={item} className={`items-center gap-4 md:gap-8 ${isHiddenOnMobile ? 'hidden sm:flex' : 'flex'}`}>
              {i > 0 && <span className="text-[#ddd]">·</span>}
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#999]">
                {item}
              </span>
            </div>
          );
        })}
      </div>

      {/* ────────────────────────── SECTION 3 — Product Grid ───────────────── */}
      <section className="px-4 py-24 md:px-8">
        <div className="mb-12 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-light md:text-4xl">The collection</h2>
          <span className="cursor-pointer border-b border-[#ddd] pb-0.5 text-[10px] uppercase tracking-[0.2em] text-secondary">
            View all
          </span>
        </div>

        {isLoading && (!apiProducts || apiProducts.length === 0) && products === FALLBACK_PRODUCTS ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ────────────────────────── SECTION 4 — Philosophy ─────────────────── */}
      <section className="bg-[#111] px-8 py-24">
        {/* Top Part */}
        <div className="mx-auto mb-16 grid max-w-[1200px] grid-cols-1 gap-16 md:grid-cols-2">
          {/* Left */}
          <div>
            <p className="mb-5 text-[10px] uppercase tracking-[0.35em] text-[#555]">
              Our philosophy
            </p>
            <h2 className="font-display mb-6 text-5xl font-light leading-[1.15] text-white md:text-[56px]">
              Clothes that
              <br />
              <span className="italic text-[#c8c0b0]">don't announce</span>
              <br />
              themselves.
            </h2>
            <p className="max-w-[400px] text-[13px] leading-[2.1] text-[#777]">
              We believe the best garment is one you forget you're wearing. No
              logos. No seasonal gimmicks. Just exceptional construction, honest
              materials, and a silhouette that ages with you.
            </p>
            <a
              href="#"
              className="mt-8 flex h-11 w-max items-center gap-2 border-b border-white/20 pb-1 text-[11px] uppercase tracking-[0.2em] text-white/60 no-underline transition-colors hover:border-white hover:text-white"
            >
              Discover the trouser
              <ArrowRight size={12} />
            </a>
          </div>

          {/* Right */}
          <div className="flex flex-col justify-center text-right">
            <span className="select-none font-display text-[180px] font-light leading-none text-[#1a1a1a]">
              01
            </span>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#444]">
              The collection
            </span>
          </div>
        </div>

        {/* Bottom Part (Grid) */}
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-px border-t border-[#1f1f1f] bg-[#1f1f1f] pt-12 sm:grid-cols-2 md:grid-cols-4">
          {philosophyDetails.map((detail) => (
            <div key={detail.label} className="bg-[#111] p-8">
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#444]">
                {detail.label}
              </p>
              <h3 className="font-display mb-2 text-[15px] font-light text-white">
                {detail.title}
              </h3>
              <p className="text-[12px] leading-[1.8] text-[#555]">
                {detail.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────── SECTION 5 — Why Aevro ──────────────────── */}
      <section className="bg-[#fafaf9] px-8 py-24">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 md:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.num} className="border border-border bg-white p-8">
                <p className="font-display mb-4 text-5xl font-light text-[#e5e5e5]">
                  {h.num}
                </p>
                <p className="mb-3 text-[12px] uppercase tracking-[0.2em] text-text">
                  {h.title}
                </p>
                <p className="text-[13px] leading-[1.8] text-secondary">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── SECTION 6 — Instagram Grid ─────────────── */}
      <section className="px-8 py-24">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-light md:text-3xl">Worn &amp; styled</h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-secondary no-underline transition-colors hover:text-text"
          >
            <Camera size={14} />
            @aevro.studio
          </a>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 md:grid-cols-5">
          {instaColors.map((_, i) => (
            <div
              key={i}
              className="flex aspect-square cursor-pointer items-center justify-center bg-[#f5f3ef] transition-colors hover:bg-[#ede9e3]"
            >
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#ccc]">
                Photo
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
