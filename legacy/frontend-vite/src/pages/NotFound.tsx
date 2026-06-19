import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-8 text-center">
      <h1 className="font-display text-[120px] font-light leading-none text-[#f0f0f0]">
        404
      </h1>
      <p className="text-[11px] uppercase tracking-[0.3em] text-secondary">
        Page not found
      </p>
      <h2 className="font-display mt-2 text-2xl font-light text-text">
        This page doesn't exist.
      </h2>
      <p className="mt-3 max-w-[300px] leading-relaxed text-[13px] text-secondary">
        The page you're looking for may have been moved or doesn't exist.
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 cursor-pointer bg-text px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-white"
        style={{ border: 'none' }}
      >
        Back to home
      </button>
    </div>
  );
}
