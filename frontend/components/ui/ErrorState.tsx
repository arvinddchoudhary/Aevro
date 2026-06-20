type ErrorStateProps = {
  title: string;
  message: string;
};

export function ErrorState({ title, message }: ErrorStateProps) {
  return (
    <div className="border border-[#111111] px-6 py-12 text-center">
      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
        {title}
      </p>
      <p className="mx-auto max-w-md text-sm leading-6 text-[#555555]">{message}</p>
    </div>
  );
}
