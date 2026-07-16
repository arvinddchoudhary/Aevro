'use client';

import { useEffect } from 'react';
import { buildApiUrl } from '../../lib/api/base-url';

const ACTIVE_PING_INTERVAL_MS = 10 * 60 * 1000;
const PING_TIMEOUT_MS = 75 * 1000;

export function BackendActivityPing() {
  useEffect(() => {
    let inFlight = false;
    let lastPingAt = 0;

    const ping = async (method: 'GET' | 'HEAD') => {
      if (inFlight || document.visibilityState !== 'visible') return;

      inFlight = true;
      lastPingAt = Date.now();
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

      try {
        await fetch(buildApiUrl('/health'), {
          method,
          cache: 'no-store',
          credentials: 'omit',
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
      } catch {
        // Health warming is best-effort and must never interrupt storefront use.
      } finally {
        window.clearTimeout(timeout);
        inFlight = false;
      }
    };

    void ping('GET');

    const interval = window.setInterval(() => {
      void ping('HEAD');
    }, ACTIVE_PING_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastPingAt >= ACTIVE_PING_INTERVAL_MS
      ) {
        void ping('HEAD');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}

