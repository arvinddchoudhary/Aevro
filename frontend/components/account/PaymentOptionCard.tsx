import { AccountIcon } from './AccountIcons';

const paymentOptionImages = {
  upi: {
    src: '/images/upi_icon_512.webp',
    alt: 'UPI payment option',
  },
  wallet: {
    src: '/images/wallet_icon_512.webp',
    alt: 'Wallet payment option',
  },
} as const;

type PaymentOptionCardProps = {
  title: string;
  detail: string;
  buttonLabel: string;
  badge: string;
  visual?: 'upi' | 'wallet';
  onAction: () => void;
};

export function PaymentOptionCard({
  badge,
  buttonLabel,
  detail,
  onAction,
  title,
  visual,
}: PaymentOptionCardProps) {
  const image = visual ? paymentOptionImages[visual] : null;

  return (
    <article className="grid min-h-[120px] gap-4 rounded-[8px] border border-[#e1d8cc] bg-[#fffdf8] p-5 shadow-[0_16px_44px_rgba(49,37,26,0.035)] sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center xl:grid-cols-[88px_minmax(0,1fr)_auto]">
      <span className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#e1d8cc] bg-[#fffaf3] text-[#514c45] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]">
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-[2rem] font-semibold italic leading-none tracking-[-0.08em] text-[#6b6a66]">
            {badge}
            <span className="ml-1 text-[#e17931]">›</span>
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-2xl font-light leading-tight text-[#111111]">
          {title}
        </h3>
        <p className="mt-2 text-base leading-6 text-[#625a51]">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-3 rounded-[6px] border border-[#ddd4c8] px-6 font-serif text-lg font-light text-[#514c45] transition hover:border-[#111111] sm:col-start-2 sm:w-auto xl:col-start-auto"
      >
        <AccountIcon name="plus" className="h-4 w-4" />
        {buttonLabel}
      </button>
    </article>
  );
}
