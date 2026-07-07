export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

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

  const refreshResponse = await fetchWithAuth('/auth/refresh', {
    method: 'POST',
  });

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

  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });
}
