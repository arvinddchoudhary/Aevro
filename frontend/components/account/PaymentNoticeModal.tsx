'use client';

type PaymentNoticeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export function PaymentNoticeModal({
  isOpen,
  onClose,
  title,
}: PaymentNoticeModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[#111111]/36 px-4 py-5 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-notice-title"
    >
      <div className="w-full border border-[#ded4c8] bg-[#fffaf3] p-6 shadow-[0_32px_90px_rgba(17,17,17,0.2)] sm:max-w-xl sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#777067]">
          Secure Payments
        </p>
        <h2
          id="payment-notice-title"
          className="mt-3 font-serif text-2xl font-light text-[#111111] sm:text-3xl"
        >
          {title}
        </h2>
        <p className="mt-4 text-sm leading-6 text-[#625a51]">
          Saved payment methods will be managed securely through our payment
          partner. You can still pay safely at checkout without AEVRO storing
          raw card numbers, CVV, UPI PINs, wallet credentials, or banking
          passwords.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex h-12 w-full items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:w-auto"
          style={{ color: '#fffaf3' }}
        >
          I Understand
        </button>
      </div>
    </div>
  );
}
