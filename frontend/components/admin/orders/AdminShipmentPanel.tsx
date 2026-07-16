'use client';

import { useEffect, useState } from 'react';
import {
  assignShiprocketAwb,
  cancelShiprocketShipment,
  createShiprocketShipment,
  getAdminShipment,
  getShiprocketRates,
  refreshShiprocketTracking,
  scheduleShiprocketPickup,
} from '../../../lib/api/admin-orders';
import { formatPrice } from '../../../lib/format';
import type { AdminOrder } from '../../../types/admin/orders';
import type {
  AdminShipment,
  AdminShipmentState,
  ShiprocketCourierRate,
} from '../../../types/shipping';

const cancellableStatuses = new Set(['AWB_ASSIGNED', 'PICKUP_SCHEDULED']);

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'Not available';
}

export function AdminShipmentPanel({
  order,
  onOrderChanged,
}: {
  order: AdminOrder;
  onOrderChanged: () => Promise<void>;
}) {
  const [state, setState] = useState<AdminShipmentState | null>(null);
  const [rates, setRates] = useState<ShiprocketCourierRate[]>([]);
  const [courierId, setCourierId] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getAdminShipment(order.id)
      .then((shipmentState) => {
        if (active) setState(shipmentState);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load shipping.');
        }
      });

    return () => {
      active = false;
    };
  }, [order.id]);

  const shipment = state?.shipment ?? null;
  const canCreate =
    state?.enabled === true &&
    (!shipment || shipment.status === 'FAILED') &&
    order.payment?.status === 'PAID' &&
    order.status === 'CONFIRMED';

  const runAction = async (
    action: string,
    task: () => Promise<AdminShipment>,
    message: string,
  ) => {
    try {
      setBusyAction(action);
      setError(null);
      setSuccess(null);
      const nextShipment = await task();
      setState((current) => ({
        enabled: current?.enabled ?? true,
        shipment: nextShipment,
      }));
      setSuccess(message);
      await onOrderChanged();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Shipping action failed.');
    } finally {
      setBusyAction(null);
    }
  };

  const loadRates = async () => {
    try {
      setBusyAction('rates');
      setError(null);
      const nextRates = await getShiprocketRates(order.id);
      setRates(nextRates);
      setCourierId(nextRates[0] ? String(nextRates[0].courierCompanyId) : '');
    } catch (ratesError) {
      setError(ratesError instanceof Error ? ratesError.message : 'Unable to load courier rates.');
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="border border-[#ddd4c8] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">Shipping</p>
          <h2 className="mt-2 text-xl font-light">Shiprocket fulfilment</h2>
        </div>
        <span className="border border-[#ddd4c8] px-3 py-1 text-xs uppercase tracking-[0.12em]">
          {shipment?.statusLabel ?? (state?.enabled === false ? 'Disabled' : 'Not created')}
        </span>
      </div>

      {state?.enabled === false && (
        <p className="mt-5 text-sm leading-6 text-[#5f5a53]">
          Shiprocket is disabled. Configure backend credentials and set SHIPROCKET_ENABLED=true.
        </p>
      )}

      {shipment ? (
        <dl className="mt-5 grid min-w-0 gap-x-6 gap-y-4 border-t border-[#e7ded2] pt-5 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-[#777777]">Shiprocket order ID</dt>
            <dd className="mt-1 break-all">{shipment.providerOrderId ?? 'Pending'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[#777777]">Shipment ID</dt>
            <dd className="mt-1 break-all">{shipment.providerShipmentId ?? 'Pending'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[#777777]">AWB</dt>
            <dd className="mt-1 break-all">{shipment.awbCode ?? 'Not assigned'}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[#777777]">Courier</dt>
            <dd className="mt-1 break-words">{shipment.courierCompanyName ?? 'Not assigned'}</dd>
          </div>
          <div>
            <dt className="text-[#777777]">Estimated delivery</dt>
            <dd className="mt-1">{formatDate(shipment.estimatedDeliveryDate)}</dd>
          </div>
          <div>
            <dt className="text-[#777777]">Last synced</dt>
            <dd className="mt-1">{formatDate(shipment.lastSyncedAt)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-5 text-sm leading-6 text-[#5f5a53]">
          Create a shipment only after payment is confirmed and the order is ready for fulfilment.
        </p>
      )}

      {shipment?.status === 'CREATED' && !shipment.awbCode && (
        <div className="mt-5 border-t border-[#e7ded2] pt-5">
          {rates.length > 0 ? (
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
                Courier service
              </span>
              <select
                value={courierId}
                onChange={(event) => setCourierId(event.target.value)}
                className="h-11 w-full border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm outline-none focus:border-[#111111]"
              >
                {rates.map((rate) => (
                  <option key={rate.courierCompanyId} value={rate.courierCompanyId}>
                    {rate.courierName}
                    {rate.rateInPaise !== null ? ` - ${formatPrice(rate.rateInPaise)}` : ''}
                    {rate.estimatedDeliveryDays !== null
                      ? ` - ${rate.estimatedDeliveryDays} days`
                      : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={loadRates}
              className="h-11 w-full border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {busyAction === 'rates' ? 'Loading couriers' : 'Check courier rates'}
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 border border-[#8a1f1f] p-3 text-sm leading-6 text-[#8a1f1f]">{error}</p>
      )}
      {success && (
        <p className="mt-4 border border-[#1f6b3a] p-3 text-sm leading-6 text-[#1f6b3a]">{success}</p>
      )}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-[#e7ded2] pt-5">
        {(!shipment || shipment.status === 'FAILED') && (
          <button
            type="button"
            disabled={!canCreate || busyAction !== null}
            onClick={() =>
              void runAction('create', () => createShiprocketShipment(order.id), 'Shipment created.')
            }
            className="h-11 border border-[#111111] bg-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:border-[#aaa39a] disabled:bg-[#aaa39a]"
          >
            {busyAction === 'create' ? 'Creating' : shipment ? 'Retry shipment' : 'Create shipment'}
          </button>
        )}
        {shipment?.status === 'CREATED' && !shipment.awbCode && rates.length > 0 && (
          <button
            type="button"
            disabled={!courierId || busyAction !== null}
            onClick={() =>
              void runAction(
                'awb',
                () => assignShiprocketAwb(order.id, Number(courierId)),
                'AWB assigned.',
              )
            }
            className="h-11 border border-[#111111] bg-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === 'awb' ? 'Assigning' : 'Assign AWB'}
          </button>
        )}
        {shipment?.awbCode && !shipment.pickupScheduledAt && (
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() =>
              void runAction(
                'pickup',
                () => scheduleShiprocketPickup(order.id),
                'Pickup scheduled.',
              )
            }
            className="h-11 border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === 'pickup' ? 'Scheduling' : 'Schedule pickup'}
          </button>
        )}
        {shipment?.awbCode && (
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() =>
              void runAction(
                'refresh',
                () => refreshShiprocketTracking(order.id),
                'Tracking refreshed.',
              )
            }
            className="h-11 border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === 'refresh' ? 'Refreshing' : 'Refresh tracking'}
          </button>
        )}
        {shipment?.awbCode && cancellableStatuses.has(shipment.status) && (
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() => {
              if (window.confirm('Cancel this Shiprocket shipment? This does not refund the order.')) {
                void runAction(
                  'cancel',
                  () => cancelShiprocketShipment(order.id),
                  'Shipment cancelled. The order was not refunded.',
                );
              }
            }}
            className="h-11 border border-[#8a1f1f] px-4 text-xs font-medium uppercase tracking-[0.08em] text-[#8a1f1f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busyAction === 'cancel' ? 'Cancelling' : 'Cancel shipment'}
          </button>
        )}
        {shipment?.trackingUrl && (
          <a
            href={shipment.trackingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center border border-[#111111] px-4 text-xs font-medium uppercase tracking-[0.08em]"
          >
            Open tracking
          </a>
        )}
      </div>
    </div>
  );
}

