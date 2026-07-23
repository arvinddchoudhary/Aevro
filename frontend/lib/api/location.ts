import { buildApiUrl } from './base-url';

export type LocationAddress = {
  city: string;
  state: string;
  postalCode: string;
  country: 'India';
};

export class LocationApiError extends Error {}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    return Array.isArray(body.message)
      ? body.message.join(' ')
      : body.message ?? 'Unable to look up this pincode.';
  } catch {
    return 'Unable to look up this pincode.';
  }
}

export async function lookupPincode(postalCode: string): Promise<LocationAddress> {
  const response = await fetch(buildApiUrl('/location/pincode'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postalCode }),
  });

  if (!response.ok) {
    throw new LocationApiError(await errorMessage(response));
  }

  const payload = (await response.json()) as {
    success?: boolean;
    data?: LocationAddress;
    message?: string | string[];
  };

  if (!payload.success || !payload.data) {
    throw new LocationApiError(
      Array.isArray(payload.message)
        ? payload.message.join(' ')
        : payload.message ?? 'Unable to look up this pincode.',
    );
  }

  return payload.data;
}
