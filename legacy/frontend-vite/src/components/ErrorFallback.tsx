import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="mx-auto h-px w-8 bg-[#ddd]" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-secondary">
        Something went wrong
      </p>
      <h2 className="font-display mt-2 text-2xl font-light text-text">
        {message || "We couldn't load this page."}
      </h2>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 cursor-pointer border border-border bg-transparent px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] text-text transition-all hover:border-text hover:bg-text hover:text-white"
        >
          Try again
        </button>
      )}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-3 cursor-pointer bg-transparent p-0 text-[11px] tracking-wide text-secondary underline-offset-4 transition-colors hover:text-text hover:underline"
        style={{ border: 'none' }}
      >
        Back to home
      </button>
    </div>
  );
}
