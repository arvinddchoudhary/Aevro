import type {
  AuthResponse,
  AuthUser,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResult,
} from '../../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

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
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
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

export async function verifyEmailOtp(code: string) {
  const data = await requestAuthAction<{ user: AuthUser }>('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  return data.user;
}

export function resendEmailOtp() {
  return requestAuthAction<{
    alreadyVerified: boolean;
    sent: boolean;
    expiresInMinutes: number;
    error?: string | null;
  }>('/auth/resend-email-otp', {
    method: 'POST',
  });
}

export async function logout() {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
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
