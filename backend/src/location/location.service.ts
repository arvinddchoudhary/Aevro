import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type GoogleAddressComponent = {
  long_name?: string;
  short_name?: string;
  types?: string[];
};

type GoogleGeocodingResult = {
  address_components?: GoogleAddressComponent[];
};

type GoogleGeocodingResponse = {
  status?: string;
  error_message?: string;
  results?: GoogleGeocodingResult[];
};

export type LocationAddress = {
  city: string;
  state: string;
  postalCode: string;
  country: 'India';
};

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

export function extractIndianAddress(
  response: GoogleGeocodingResponse,
): LocationAddress | null {
  for (const result of response.results ?? []) {
    const components = result.address_components ?? [];
    const valueFor = (...types: string[]) =>
      components.find((component) =>
        types.some((type) => component.types?.includes(type)),
      )?.long_name?.trim();
    const country = components.find((component) => component.types?.includes('country'));

    if (country?.short_name !== 'IN') {
      continue;
    }

    const postalCode = valueFor('postal_code');
    const city = valueFor(
      'locality',
      'postal_town',
      'administrative_area_level_3',
      'administrative_area_level_2',
      'sublocality_level_1',
    );
    const state = valueFor('administrative_area_level_1');

    if (postalCode && city && state) {
      return { city, state, postalCode, country: 'India' };
    }
  }

  return null;
}

@Injectable()
export class LocationService {
  private readonly requestsByIp = new Map<string, { count: number; resetAt: number }>();

  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  async lookupPincode(postalCode: string, clientIp: string): Promise<LocationAddress> {
    this.assertWithinRateLimit(clientIp);

    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', postalCode);
    url.searchParams.set('components', 'country:IN');
    url.searchParams.set('language', 'en');
    url.searchParams.set('region', 'in');
    url.searchParams.set('result_type', 'postal_code');
    url.searchParams.set('key', this.getApiKey());

    let response: Response;

    try {
      response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    } catch {
      throw new BadGatewayException('Unable to look up this pincode.');
    }

    if (!response.ok) {
      throw new BadGatewayException('Unable to look up this pincode.');
    }

    let body: GoogleGeocodingResponse;

    try {
      body = (await response.json()) as GoogleGeocodingResponse;
    } catch {
      throw new BadGatewayException('Location provider returned an invalid response.');
    }

    if (body.status === 'ZERO_RESULTS') {
      throw new BadRequestException('Enter a valid Indian pincode.');
    }

    if (body.status !== 'OK') {
      throw new BadGatewayException('Unable to look up this pincode.');
    }

    const address = extractIndianAddress(body);

    if (!address || address.postalCode !== postalCode) {
      throw new BadRequestException(
        'Enter a valid Indian pincode.',
      );
    }

    return address;
  }

  private getApiKey() {
    const apiKey = this.config.get<string>('GOOGLE_MAPS_GEOCODING_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('Location lookup is not configured.');
    }

    return apiKey;
  }

  private assertWithinRateLimit(clientIp: string) {
    const now = Date.now();
    const current = this.requestsByIp.get(clientIp);

    if (!current || current.resetAt <= now) {
      this.requestsByIp.set(clientIp, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
      return;
    }

    if (current.count >= MAX_REQUESTS_PER_WINDOW) {
      throw new HttpException(
        'Too many location requests. Please try again shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
  }
}
