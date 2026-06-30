import type { ReactNode } from 'react';

type AuthCardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
};

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  compact = false,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-[30rem]">
      <div className={`${compact ? 'mb-5' : 'mb-8'} text-center`}>
        <div
          aria-label="AEVRO"
          className={`mx-auto bg-[#a98555] drop-shadow-[0.6px_0_0_#a98555] ${compact ? 'h-9 w-40' : 'h-10 w-44'}`}
          style={{
            maskImage: "url('/images/brand/aevro-wordmark.png')",
            WebkitMaskImage: "url('/images/brand/aevro-wordmark.png')",
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
          }}
        />
        <div className={`${compact ? 'mt-5' : 'mt-8'} flex items-center justify-center gap-5`}>
          <span className="h-px w-14 bg-[#b89464]" />
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#514c45]">
            {eyebrow}
          </p>
          <span className="h-px w-14 bg-[#b89464]" />
        </div>
        <h1 className={`${compact ? 'mt-4 text-[1.9rem] sm:text-4xl' : 'mt-7 text-[2rem] sm:text-5xl'} font-serif uppercase leading-tight tracking-[0.08em] sm:tracking-[0.14em]`}>
          {title}
        </h1>
        <p className={`${compact ? 'mt-3' : 'mt-5'} text-sm leading-6 text-[#6d665e]`}>{subtitle}</p>
      </div>

      {children}

      {footer && <div className={`${compact ? 'mt-5' : 'mt-8'} text-center`}>{footer}</div>}
    </div>
  );
}
