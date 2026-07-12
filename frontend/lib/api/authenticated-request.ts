import { buildApiUrl, getApiBaseUrl } from './base-url';

export const API_URL = getApiBaseUrl();

let refreshPromise: Promise<Response> | null = null;

type AuthenticatedRequestOptions = RequestInit & {
  retryOnUnauthorized?: boolean;
};

export async function authenticatedFetch(
  path: string,
  options: AuthenticatedRequestOptions = {},
) {
  const { retryOnUnauthorized = true, ...requestOptions } = options;
  const response = await fetchWithAuth(path, requestOptions);

  if (
    response.status !== 401 ||
    !retryOnUnauthorized ||
    path === '/auth/refresh'
  ) {
    return response;
  }

  refreshPromise ??= fetchWithAuth('/auth/refresh', {
    method: 'POST',
  }).finally(() => {
    refreshPromise = null;
  });

  const refreshResponse = await refreshPromise;

  if (!refreshResponse.ok) {
    return response;
  }

  return fetchWithAuth(path, requestOptions);
}

function fetchWithAuth(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(buildApiUrl(path), {
    ...options,
    credentials: 'include',
    headers,
  });
}
