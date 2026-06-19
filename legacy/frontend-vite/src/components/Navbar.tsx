import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const totalItems = useCartStore((s) => s.totalItems());
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 flex h-16 items-center justify-between bg-white px-4 md:px-8 ${
        scrolled ? 'border-b border-border' : 'border-b border-transparent'
      }`}
      style={{ transition: 'border-color 0.3s ease' }}
    >
      {/* Left — spacer for visual balance */}
      <div className="w-16 md:w-20" />

      {/* Center — Logo */}
      <Link 
        to="/" 
        className="flex items-center text-[22px] hover:no-underline md:text-[28px]"
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontWeight: '400',
          letterSpacing: '0.22em',
          color: '#111111',
          textDecoration: 'none',
          lineHeight: 1,
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}
      >
        AEVRO
      </Link>

      {/* Right — Icons */}
      <div className="flex w-16 items-center justify-end gap-3 md:w-20 md:gap-5">
        <button
          type="button"
          aria-label="Search"
          className="flex h-11 w-11 cursor-pointer items-center justify-center bg-transparent p-0 text-text"
          style={{ border: 'none' }}
        >
          <Search size={18} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          aria-label="Open cart"
          onClick={openDrawer}
          className="relative flex h-11 w-11 cursor-pointer items-center justify-center bg-transparent p-0 text-text"
          style={{ border: 'none' }}
        >
          <ShoppingBag size={18} strokeWidth={1.5} />
          {totalItems > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-dark text-[10px] font-medium text-white md:-right-1 md:-top-0.5">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
