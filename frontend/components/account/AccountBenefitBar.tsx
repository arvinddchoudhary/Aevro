import { AccountIcon } from './AccountIcons';

const benefits = [
  {
    title: 'Complimentary Shipping',
    detail: 'On all orders above ₹4999',
    icon: 'truck',
  },
  {
    title: 'Easy Returns',
    detail: '14 days return policy',
    icon: 'refresh',
  },
  {
    title: 'Secure Payments',
    detail: '100% protected transactions',
    icon: 'shield',
  },
  {
    title: 'Customer Support',
    detail: "We're here to help you",
    icon: 'phone',
  },
] as const;

export function AccountBenefitBar() {
  return (
    <section className="border-y border-[#e1d8cc] bg-[#f5eee5]">
      <div className="aevro-container grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.title}
            className={`flex items-center gap-4 py-5 sm:px-5 ${
              index < benefits.length - 1 ? 'lg:border-r lg:border-[#e1d8cc]' : ''
            }`}
          >
            <AccountIcon name={benefit.icon} className="h-8 w-8 shrink-0 text-[#111111]" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]">
                {benefit.title}
              </h3>
              <p className="mt-1 text-sm text-[#5f574f]">{benefit.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
