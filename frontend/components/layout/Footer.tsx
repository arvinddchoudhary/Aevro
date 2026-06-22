import Link from 'next/link';

const serviceItems = [
  ['Delivery', 'Complimentary shipping', 'On all orders'],
  ['Returns', 'Easy returns', 'Within 14 days'],
  ['Secure', 'Secure payments', '100% protected'],
  ['Care', 'Personal assistance', "We're here to help"],
];

const footerGroups = [
  {
    title: 'Shop',
    links: ['Trousers', 'Shirts', 'Knitwear', 'Outerwear', 'Accessories'],
  },
  {
    title: 'Collections',
    links: ['Summer Edit', 'Core Collection', 'Workwear', 'Travel Edit'],
  },
  {
    title: 'About',
    links: ['Our Story', 'Philosophy', 'Craftsmanship', 'Sustainability'],
  },
  {
    title: 'Help',
    links: ['Orders & Shipping', 'Returns & Exchanges', 'Size Guide', 'Contact Us'],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#ddd4c8] bg-[#fbf7f0]">
      <section className="border-b border-[#ddd4c8]">
        <div className="aevro-container grid gap-0 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceItems.map(([label, title, detail]) => (
            <div
              key={title}
              className="flex gap-4 border-b border-[#ddd4c8] py-5 last:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0 lg:border-b-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#111111] text-[10px] uppercase">
                {label.slice(0, 2)}
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.08em]">{title}</p>
                <p className="mt-1 text-xs text-[#6f685f]">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="aevro-container grid gap-10 py-12 lg:grid-cols-[1.1fr_2fr_1fr]">
        <div>
          <Link href="/" className="inline-flex" aria-label="AEVRO home">
            <img
              src="/images/brand/aevro-wordmark.png"
              alt="AEVRO"
              className="h-10 w-auto md:h-11"
            />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-[#514c45]">
            Modern essentials. Timeless design. Thoughtfully made to move with
            you, every day.
          </p>
          <div className="mt-6 flex gap-4 text-sm">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>Pinterest</span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-medium uppercase tracking-[0.08em]">
                {group.title}
              </p>
              <div className="mt-4 space-y-2 text-sm text-[#514c45]">
                {group.links.map((link) => (
                  <Link
                    key={link}
                    href={group.title === 'Shop' ? '/products' : '#'}
                    className="block underline-offset-4 hover:underline"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em]">
            Stay in touch
          </p>
          <p className="mt-4 text-sm leading-6 text-[#514c45]">
            Sign up for early access to new collections and exclusive offers.
          </p>
          <div className="mt-6 flex border-b border-[#111111]">
            <input
              placeholder="Email address"
              className="h-11 flex-1 bg-transparent text-sm outline-none"
            />
            <button className="px-2 text-xl" aria-label="Submit email">
              →
            </button>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ddd4c8]">
        <div className="aevro-container flex flex-col gap-3 py-6 text-xs text-[#514c45] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AEVRO. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms & Conditions</Link>
          </div>
        </div>
      </section>
    </footer>
  );
}
