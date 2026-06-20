type OrderStatusPillProps = {
  label: string;
};

export function OrderStatusPill({ label }: OrderStatusPillProps) {
  return (
    <span className="inline-flex border border-[#d9d9d9] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#555555]">
      {label}
    </span>
  );
}
