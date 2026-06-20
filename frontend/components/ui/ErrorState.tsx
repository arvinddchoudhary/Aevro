type ErrorStateProps = {
  title: string;
  message: string;
};

export function ErrorState({ title, message }: ErrorStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="mx-auto h-px w-8 bg-[#ddd]" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-secondary">
        {title}
      </p>
      <h2 className="font-display mt-1 text-2xl font-light text-text">
        Something went wrong
      </h2>
      <p className="mt-1 max-w-md text-[13px] leading-relaxed text-secondary">
        {message}
      </p>
    </div>
  );
}
