const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

export function getApiBaseUrl() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;

  if (typeof window === 'undefined') {
    return configuredApiUrl;
  }

  try {
    const apiUrl = new URL(configuredApiUrl);
    const pageHost = window.location.hostname;

    if (isLocalHost(apiUrl.hostname) && isLocalHost(pageHost)) {
      apiUrl.hostname = pageHost;
    }

    return apiUrl.toString().replace(/\/$/, '');
  } catch {
    return configuredApiUrl;
  }
}

export function buildApiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`;
}

function isLocalHost(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}
