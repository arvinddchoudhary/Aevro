import type {
  AddressPayload,
  UpdateProfilePayload,
  UserAddress,
  UserCollectionResponse,
  UserItemResponse,
  UserProfile,
} from '../../types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export class UsersApiError extends Error {
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

    return body.message ?? 'User request failed.';
  } catch {
    return 'User request failed.';
  }
}

async function userRequest<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new UsersApiError(await parseErrorMessage(response), response.status);
  }

  const payload = (await response.json()) as T;

  return payload;
}

function assertItemSuccess<T>(response: UserItemResponse<T>) {
  if (!response.success) {
    throw new UsersApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

function assertCollectionSuccess<T>(response: UserCollectionResponse<T>) {
  if (!response.success) {
    throw new UsersApiError(
      Array.isArray(response.message) ? response.message.join(' ') : response.message,
      response.statusCode,
    );
  }

  return response.data;
}

export async function getUserProfile() {
  return assertItemSuccess(
    await userRequest<UserItemResponse<UserProfile>>('/users/me', {
      method: 'GET',
    }),
  );
}

export async function updateUserProfile(payload: UpdateProfilePayload) {
  return assertItemSuccess(
    await userRequest<UserItemResponse<UserProfile>>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  );
}

export async function getUserAddresses() {
  return assertCollectionSuccess(
    await userRequest<UserCollectionResponse<UserAddress>>('/users/me/addresses', {
      method: 'GET',
    }),
  );
}

export async function createUserAddress(payload: AddressPayload) {
  return assertItemSuccess(
    await userRequest<UserItemResponse<UserAddress>>('/users/me/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateUserAddress(id: string, payload: AddressPayload) {
  return assertItemSuccess(
    await userRequest<UserItemResponse<UserAddress>>(
      `/users/me/addresses/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    ),
  );
}

export async function setDefaultUserAddress(id: string) {
  return assertItemSuccess(
    await userRequest<UserItemResponse<UserAddress>>(
      `/users/me/addresses/${encodeURIComponent(id)}/default`,
      {
        method: 'PATCH',
      },
    ),
  );
}

export async function deleteUserAddress(id: string) {
  return assertItemSuccess(
    await userRequest<UserItemResponse<{ id: string }>>(
      `/users/me/addresses/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      },
    ),
  );
}
