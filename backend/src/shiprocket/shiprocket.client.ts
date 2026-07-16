import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  JsonRecord,
  ShiprocketCreateOrderPayload,
  ShiprocketProviderError,
} from './shiprocket.types';

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: JsonRecord | ShiprocketCreateOrderPayload;
  query?: Record<string, string | number>;
};

@Injectable()
export class ShiprocketClient {
  private readonly logger = new Logger(ShiprocketClient.name);
  private readonly baseUrl: string;
  private token: string | null = null;
  private tokenExpiresAt = 0;
  private authenticationPromise: Promise<string> | null = null;

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    this.baseUrl = this.config
      .get<string>('SHIPROCKET_BASE_URL', 'https://apiv2.shiprocket.in/v1/external')
      .replace(/\/$/, '');
  }

  async createOrder(payload: ShiprocketCreateOrderPayload) {
    return this.request('/orders/create/adhoc', { method: 'POST', body: payload });
  }

  async findOrders(search: string) {
    return this.request('/orders', { query: { search } });
  }

  async assignAwb(shipmentId: string, courierId: number) {
    return this.request('/courier/assign/awb', {
      method: 'POST',
      body: { shipment_id: Number(shipmentId), courier_id: courierId },
    });
  }

  async schedulePickup(shipmentId: string, pickupDate?: string) {
    return this.request('/courier/generate/pickup', {
      method: 'POST',
      body: {
        shipment_id: [Number(shipmentId)],
        ...(pickupDate ? { pickup_date: [pickupDate] } : {}),
      },
    });
  }

  async cancelShipment(awbCode: string) {
    return this.request('/orders/cancel/shipment/awbs', {
      method: 'POST',
      body: { awbs: [awbCode] },
    });
  }

  async trackAwb(awbCode: string) {
    return this.request(`/courier/track/awb/${encodeURIComponent(awbCode)}`);
  }

  async getPickupLocations() {
    return this.request('/settings/company/pickup');
  }

  async getServiceability(query: Record<string, string | number>) {
    return this.request('/courier/serviceability/', { query });
  }

  private async request(
    path: string,
    options: RequestOptions = {},
    retried = false,
  ): Promise<JsonRecord> {
    const token = await this.getToken();
    const url = new URL(`${this.baseUrl}${path}`);

    Object.entries(options.query ?? {}).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (response.status === 401 && !retried) {
        this.clearToken();
        return this.request(path, options, true);
      }

      const payload = await this.readJson(response);

      if (!response.ok) {
        this.logger.warn(`Shiprocket request failed | path=${path} | status=${response.status}`);
        throw new ShiprocketProviderError(
          this.providerMessage(payload) ?? 'Shiprocket rejected the request.',
          response.status,
          this.safeProviderDetails(payload),
        );
      }

      return payload;
    } catch (error) {
      if (error instanceof ShiprocketProviderError) {
        throw error;
      }

      const timedOut = error instanceof Error && error.name === 'AbortError';
      this.logger.warn(`Shiprocket request unavailable | path=${path} | timeout=${timedOut}`);
      throw new ShiprocketProviderError(
        timedOut ? 'Shiprocket request timed out.' : 'Shiprocket is currently unavailable.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private async getToken() {
    if (this.token && Date.now() < this.tokenExpiresAt - 5 * 60 * 1000) {
      return this.token;
    }

    if (!this.authenticationPromise) {
      this.authenticationPromise = this.authenticate().finally(() => {
        this.authenticationPromise = null;
      });
    }

    return this.authenticationPromise;
  }

  private async authenticate() {
    const email = this.config.get<string>('SHIPROCKET_EMAIL')?.trim();
    const password = this.config.get<string>('SHIPROCKET_PASSWORD');

    if (!email || !password) {
      throw new ShiprocketProviderError('Shiprocket credentials are not configured.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      const payload = await this.readJson(response);
      const token = typeof payload.token === 'string' ? payload.token : null;

      if (!response.ok || !token) {
        this.logger.warn(`Shiprocket authentication failed | status=${response.status}`);
        throw new ShiprocketProviderError('Shiprocket authentication failed.', response.status);
      }

      this.token = token;
      this.tokenExpiresAt = this.tokenExpiry(token);
      return token;
    } catch (error) {
      if (error instanceof ShiprocketProviderError) throw error;
      throw new ShiprocketProviderError(
        error instanceof Error && error.name === 'AbortError'
          ? 'Shiprocket authentication timed out.'
          : 'Shiprocket authentication is unavailable.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private clearToken() {
    this.token = null;
    this.tokenExpiresAt = 0;
  }

  private tokenExpiry(token: string) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString()) as {
        exp?: number;
      };
      if (payload.exp) return payload.exp * 1000;
    } catch {
      // Shiprocket documents a 10-day token lifetime; use nine days if JWT expiry is unavailable.
    }
    return Date.now() + 9 * 24 * 60 * 60 * 1000;
  }

  private async readJson(response: Response): Promise<JsonRecord> {
    const text = await response.text();
    if (!text) return {};
    try {
      const value = JSON.parse(text) as unknown;
      return value && typeof value === 'object' && !Array.isArray(value)
        ? (value as JsonRecord)
        : { data: value };
    } catch {
      return { message: 'Shiprocket returned an unreadable response.' };
    }
  }

  private providerMessage(payload: JsonRecord) {
    const message = payload.message ?? payload.error ?? payload.errors;
    if (typeof message === 'string') return message.slice(0, 300);
    return null;
  }

  private safeProviderDetails(payload: JsonRecord): JsonRecord {
    const allowedKeys = ['message', 'status_code', 'errors'];
    return Object.fromEntries(allowedKeys.filter((key) => key in payload).map((key) => [key, payload[key]]));
  }
}
