import { Link } from 'react-router-dom';

const footerLinkClass =
  'block text-[#888] text-xs leading-7 no-underline transition-colors hover:text-white';
const footerHeadingClass =
  'mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#555]';

export default function Footer() {
  return (
    <footer className="bg-dark pb-8 pt-12 text-white md:pt-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 sm:grid-cols-2 md:grid-cols-4 md:gap-12 md:px-8">
        {/* Brand */}
        <div>
          <Link 
            to="/" 
            className="mb-4 inline-block text-[22px] hover:no-underline"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: '400',
              letterSpacing: '0.22em',
              color: '#ffffff',
              textDecoration: 'none',
              lineHeight: 1,
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            AEVRO
          </Link>
          <p className="max-w-[200px] text-xs leading-relaxed text-[#555]">
            Premium wide-leg pleated trousers. Minimal. Modern. Made to last.
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className={footerHeadingClass}>SHOP</h4>
          <nav>
            <Link to="/products/wide-leg-pleated-trouser-black" className={footerLinkClass}>
              Black trouser
            </Link>
            <Link to="/products/wide-leg-pleated-trouser-charcoal" className={footerLinkClass}>
              Charcoal grey
            </Link>
            <Link to="/products/wide-leg-pleated-trouser-beige" className={footerLinkClass}>
              Beige
            </Link>
          </nav>
        </div>

        {/* Info */}
        <div>
          <h4 className={footerHeadingClass}>INFO</h4>
          <nav>
            <a href="#" className={footerLinkClass}>About</a>
            <a href="#" className={footerLinkClass}>Shipping &amp; returns</a>
            <a href="#" className={footerLinkClass}>FAQ</a>
            <a href="#" className={footerLinkClass}>Contact</a>
          </nav>
        </div>

        {/* Legal */}
        <div>
          <h4 className={footerHeadingClass}>LEGAL</h4>
          <nav>
            <a href="#" className={footerLinkClass}>Privacy policy</a>
            <a href="#" className={footerLinkClass}>Terms of service</a>
            <a href="#" className={footerLinkClass}>Refund policy</a>
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 px-6 pt-6 sm:flex-row sm:gap-0 md:px-8"
        style={{ borderTop: '1px solid #222' }}
      >
        <p className="text-xs text-[#444]">
          &copy; 2026 Aevro. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#555] no-underline transition-colors hover:text-white"
          >
            Instagram
          </a>
          <a
            href="https://wa.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#555] no-underline transition-colors hover:text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
