type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-secondary">
        {title}
      </p>
      <p className="font-display mt-1 text-2xl font-light text-text">
        {message}
      </p>
    </div>
  );
}
