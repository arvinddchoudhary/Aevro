const iconClassName = 'h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8';

const benefitItems = [
  {
    title: 'Free shipping',
    detail: 'On all orders above ₹ 4999',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className={iconClassName}>
        <path d="M12 57h44V25H12v32Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M56 38h14l12 13v6H56V38Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M20 66a7 7 0 1 0 14 0 7 7 0 0 0-14 0ZM66 66a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M8 66h12M34 66h32M80 66h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Easy Exchange',
    detail: '14 days Exchange policy',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className={iconClassName}>
        <path d="M25 22a34 34 0 0 1 47 4l6 7M78 20v13H65M71 74a34 34 0 0 1-47-4l-6-7M18 76V63h13" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Secure payments',
    detail: '100% secure checkout',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className={iconClassName}>
        <path d="M48 12 76 24v20c0 18-11 31-28 40-17-9-28-22-28-40V24l28-12Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M37 46h22v17H37V46ZM42 46v-7a6 6 0 0 1 12 0v7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Customer support',
    detail: 'theaevro.official@gmail.com',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className={iconClassName}>
        <path d="M22 55v-9a26 26 0 0 1 52 0v9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        <path d="M15 53c0-5 3-9 7-9h5v23h-5c-4 0-7-4-7-9v-5ZM81 53c0-5-3-9-7-9h-5v23h5c4 0 7-4 7-9v-5Z" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
] as const;

export function BenefitStrip({ className = '' }: { className?: string }) {
  return (
    <section className={`border-y border-[#ddd4c8] bg-[#fbf7f0] px-3 py-3 sm:px-6 lg:px-10 ${className}`}>
      <div className="mx-auto grid max-w-[1820px] overflow-hidden rounded-[12px] border border-[#eadfd2] bg-[#fffaf3]/80 shadow-[0_14px_40px_rgba(49,37,26,0.04)] sm:grid-cols-2 lg:grid-cols-4">
        {benefitItems.map((item, index) => (
          <article
            key={item.title}
            className={`flex min-h-[78px] items-center justify-start gap-3 px-4 py-3 text-left sm:min-h-[96px] sm:justify-center sm:gap-4 sm:px-5 sm:py-4 lg:min-h-[108px] ${
              index < benefitItems.length - 1 ? 'border-b border-[#eadfd2] sm:border-b-0 lg:border-r' : ''
            } ${index < 2 ? 'sm:border-b sm:border-[#eadfd2] lg:border-b-0' : ''} ${index % 2 === 0 ? 'sm:border-r sm:border-[#eadfd2]' : ''}`}
          >
            <div className="shrink-0 text-[#8d7d69]">{item.icon}</div>
            <div>
              <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#211d18] sm:text-xs sm:tracking-[0.22em]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#62574c] sm:mt-2 sm:text-sm">{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
