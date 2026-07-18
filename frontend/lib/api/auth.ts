import type {
  AuthResponse,
  AuthUser,
  GoogleLoginPayload,
  LoginOtpPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResult,
  VerifyLoginOtpPayload,
} from '../../types/auth';
import { buildApiUrl } from './base-url';

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
  ) {
    super(message);
  }
}

async function parseErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return body.message.join(' ');
    }

    return body.message ?? 'Authentication request failed.';
  } catch {
    return 'Authentication request failed.';
  }
}

async function requestAuthData(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw new AuthApiError(await parseErrorMessage(response), response.status);
  }

  const payload = (await response.json()) as AuthResponse;

  if (!payload.success) {
    throw new AuthApiError(
      Array.isArray(payload.message) ? payload.message.join(' ') : payload.message,
      payload.statusCode,
    );
  }

  return payload.data;
}

async function requestAuth(path: string, options: RequestInit = {}) {
  const data = await requestAuthData(path, options);

  if (!data.user) {
    throw new AuthApiError('Authentication response did not include a user.');
  }

  return data.user;
}

type AuthActionResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };

async function requestAuthAction<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildApiUrl(path), {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    throw new AuthApiError(await parseErrorMessage(response), response.status);
  }

  const payload = (await response.json()) as AuthActionResponse<T>;

  if (!payload.success) {
    throw new AuthApiError(
      Array.isArray(payload.message) ? payload.message.join(' ') : payload.message,
      payload.statusCode,
    );
  }

  return payload.data;
}

export function register(payload: RegisterPayload) {
  return requestAuthData('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<RegisterResult>;
}

export function login(payload: LoginPayload) {
  return requestAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function sendLoginOtp(payload: LoginOtpPayload) {
  return requestAuthAction<{
    email: string;
    sent: boolean;
    expiresInMinutes: number;
    resendCount?: number;
  }>('/auth/login/send-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyLoginOtp(payload: VerifyLoginOtpPayload) {
  const data = await requestAuthAction<{ user: AuthUser }>(
    '/auth/login/verify-otp',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return data.user;
}

export function googleLogin(payload: GoogleLoginPayload) {
  return requestAuth('/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refreshSession() {
  return requestAuth('/auth/refresh', {
    method: 'POST',
  });
}

export async function verifyEmailOtp(email: string, code: string) {
  const data = await requestAuthAction<{ user: AuthUser }>('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });

  return data.user;
}

export function resendEmailOtp(email: string) {
  return requestAuthAction<{
    alreadyVerified: boolean;
    sent: boolean;
    expiresInMinutes: number;
    error?: string | null;
  }>('/auth/resend-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function logout() {
  const response = await fetch(buildApiUrl('/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new AuthApiError('Unable to end your secure session. Please try again.', response.status);
  }

  try {
    const payload = (await response.json()) as AuthActionResponse<{ loggedOut: boolean }>;

    if (!payload.success || !payload.data.loggedOut) {
      throw new AuthApiError('Unable to end your secure session. Please try again.');
    }
  } catch (error) {
    if (error instanceof AuthApiError) {
      throw error;
    }

    throw new AuthApiError('Unable to confirm that your secure session was ended. Please try again.');
  }
}

export async function getCurrentUser() {
  try {
    return await requestAuth('/auth/me', {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof AuthApiError && error.statusCode === 401) {
      try {
        await refreshSession();

        return await requestAuth('/auth/me', {
          method: 'GET',
        });
      } catch {
        return null;
      }
    }

    return null;
  }
}
