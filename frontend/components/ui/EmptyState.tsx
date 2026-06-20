type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="border border-[#e5e5e5] px-6 py-12 text-center">
      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
        {title}
      </p>
      <p className="mx-auto max-w-md text-sm leading-6 text-[#555555]">{message}</p>
    </div>
  );
}
