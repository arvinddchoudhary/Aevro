type OrderStatusPillProps = {
  label: string;
};

export function OrderStatusPill({ label }: OrderStatusPillProps) {
  return (
    <span className="inline-flex border border-[#ddd4c8] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#5f5a53]">
      {label}
    </span>
  );
}
