import Link from 'next/link';
import { AdminIcon } from './AdminIcons';

type AdminMetricCardProps = {
  icon: 'bag' | 'product' | 'upload' | 'users';
  label: string;
  value: string | number;
  href?: string;
  linkLabel: string;
};

export function AdminMetricCard({
  href,
  icon,
  label,
  linkLabel,
  value,
}: AdminMetricCardProps) {
  const content = (
    <article className="h-full rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-5 text-center shadow-[0_18px_70px_rgba(44,34,24,0.045)] transition hover:border-[#cbbba8]">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eee7dd] text-[#111111]">
        <AdminIcon name={icon} className="h-6 w-6" />
      </span>
      <p className="mt-4 font-serif text-3xl leading-none text-[#111111]">{value}</p>
      <p className="mt-3 text-[0.66rem] font-medium uppercase tracking-[0.26em] text-[#7c746b]">
        {label}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm text-[#111111]">
        {linkLabel}
        <AdminIcon name="arrow" className="h-4 w-4 text-[#a56f3c]" />
      </span>
    </article>
  );

  return href ? (
    <Link href={href} className="block h-full cursor-pointer">
      {content}
    </Link>
  ) : (
    content
  );
}

type AdminActionCardProps = {
  icon: 'home' | 'product' | 'bag' | 'upload' | 'users';
  title: string;
  description: string;
  href?: string;
};

export function AdminActionCard({
  description,
  href,
  icon,
  title,
}: AdminActionCardProps) {
  const body = (
    <article className="grid h-full gap-5 rounded-[8px] border border-[#ddd4c8] bg-[#fffaf3]/84 p-6 shadow-[0_18px_70px_rgba(44,34,24,0.035)] sm:grid-cols-[88px_minmax(0,1fr)] sm:items-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eee7dd] text-[#111111]">
        <AdminIcon name={icon} className="h-8 w-8" />
      </span>
      <span>
        <h2 className="font-serif text-2xl font-light leading-tight text-[#111111]">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-[#625a51]">
          {description}
        </p>
        <span className="mt-5 inline-flex h-10 items-center gap-3 rounded-[4px] bg-[#111111] px-5 text-sm text-[#fffaf3]">
          Open
          <AdminIcon name="arrow" className="h-4 w-4" />
        </span>
      </span>
    </article>
  );

  return href ? (
    <Link href={href} className="block h-full cursor-pointer">
      {body}
    </Link>
  ) : (
    <div className="opacity-65">{body}</div>
  );
}
