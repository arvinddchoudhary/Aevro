import type { OrderTracking } from '../../types/shipping';

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : null;
}

export function OrderTrackingPanel({ tracking }: { tracking: OrderTracking | null }) {
  return (
    <section className="mt-8 border border-[#ddd4c8] p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">Delivery</p>
      {!tracking ? (
        <p className="mt-4 text-sm leading-6 text-[#5f5a53]">
          Shipping details will appear once your order is dispatched.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-4 border-b border-[#ddd4c8] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-light">{tracking.statusLabel ?? tracking.status}</h2>
              <p className="mt-2 break-words text-sm text-[#5f5a53]">
                {tracking.courierCompanyName ?? 'Courier assignment pending'}
                {tracking.awbCode ? ` / AWB ${tracking.awbCode}` : ''}
              </p>
              {tracking.estimatedDeliveryDate && (
                <p className="mt-2 text-sm text-[#5f5a53]">
                  Estimated delivery {formatDate(tracking.estimatedDeliveryDate)}
                </p>
              )}
            </div>
            {tracking.trackingUrl && (
              <a
                href={tracking.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 shrink-0 items-center justify-center bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.08em] text-white"
              >
                Track package
              </a>
            )}
          </div>

          <ol className="mt-5 space-y-4">
            {tracking.timeline.length > 0 ? (
              tracking.timeline.map((event, index) => (
                <li key={`${event.status}-${event.occurredAt ?? index}`} className="grid grid-cols-[10px_1fr] gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-[#111111]" />
                  <div>
                    <p className="text-sm font-medium">{event.statusLabel}</p>
                    {(event.activity || event.location || event.occurredAt) && (
                      <p className="mt-1 text-xs leading-5 text-[#777777]">
                        {[event.activity, event.location, formatDate(event.occurredAt)]
                          .filter(Boolean)
                          .join(' / ')}
                      </p>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm text-[#5f5a53]">Order confirmed. Preparing for dispatch.</li>
            )}
          </ol>
        </>
      )}
    </section>
  );
}

