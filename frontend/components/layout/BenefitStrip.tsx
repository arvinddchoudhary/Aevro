const benefitItems = [
  {
    title: 'Free shipping',
    detail: 'On all orders above ₹ 4999',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-8 w-8">
        <path d="M12 57h44V25H12v32Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M56 38h14l12 13v6H56V38Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M20 66a7 7 0 1 0 14 0 7 7 0 0 0-14 0ZM66 66a7 7 0 1 0 14 0 7 7 0 0 0-14 0Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M8 66h12M34 66h32M80 66h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Easy returns',
    detail: '14 days return policy',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-8 w-8">
        <path d="M25 22a34 34 0 0 1 47 4l6 7M78 20v13H65M71 74a34 34 0 0 1-47-4l-6-7M18 76V63h13" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Secure payments',
    detail: '100% secure checkout',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-8 w-8">
        <path d="M48 12 76 24v20c0 18-11 31-28 40-17-9-28-22-28-40V24l28-12Z" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M37 46h22v17H37V46ZM42 46v-7a6 6 0 0 1 12 0v7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      </svg>
    ),
  },
  {
    title: 'Customer support',
    detail: 'support@aevro.com',
    icon: (
      <svg viewBox="0 0 96 96" aria-hidden="true" className="h-8 w-8">
        <path d="M22 55v-9a26 26 0 0 1 52 0v9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
        <path d="M15 53c0-5 3-9 7-9h5v23h-5c-4 0-7-4-7-9v-5ZM81 53c0-5-3-9-7-9h-5v23h5c4 0 7-4 7-9v-5Z" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
] as const;

export function BenefitStrip({ className = '' }: { className?: string }) {
  return (
    <section className={`border-y border-[#ddd4c8] bg-[#fbf7f0] px-4 py-3 sm:px-6 lg:px-10 ${className}`}>
      <div className="mx-auto grid max-w-[1820px] overflow-hidden rounded-[12px] border border-[#eadfd2] bg-[#fffaf3]/80 shadow-[0_14px_40px_rgba(49,37,26,0.04)] sm:grid-cols-2 lg:grid-cols-4">
        {benefitItems.map((item, index) => (
          <article
            key={item.title}
            className={`flex min-h-[92px] items-center justify-center gap-4 px-5 py-4 text-left sm:min-h-[100px] lg:min-h-[108px] ${
              index < benefitItems.length - 1 ? 'border-b border-[#eadfd2] sm:border-b-0 lg:border-r' : ''
            } ${index < 2 ? 'sm:border-b sm:border-[#eadfd2] lg:border-b-0' : ''} ${index % 2 === 0 ? 'sm:border-r sm:border-[#eadfd2]' : ''}`}
          >
            <div className="shrink-0 text-[#8d7d69]">{item.icon}</div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#211d18]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-5 text-[#62574c]">{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
