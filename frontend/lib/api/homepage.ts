import type { ApiCollectionResponse } from '../../types/catalog';
import type { HomepageSection } from '../../types/homepage';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message: string, readonly statusCode?: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${path}`;

    try {
      const body = (await response.json()) as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(body.message)) {
        message = body.message.join(' ');
      } else {
        message = body.message ?? body.error ?? message;
      }
    } catch {
      message = `API request failed: ${path}`;
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const response = await request<ApiCollectionResponse<HomepageSection>>('/homepage');
  return response.data;
}

export async function getAdminHomepageSections(): Promise<HomepageSection[]> {
  const response = await request<ApiCollectionResponse<HomepageSection>>('/admin/homepage-sections', {
    credentials: 'include',
  });
  return response.data;
}

export type CreateHomepageSectionInput = {
  type: HomepageSection['type'];
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  metadata?: string;
};

export async function createHomepageSection(
  section: CreateHomepageSectionInput,
): Promise<HomepageSection> {
  const response = await request<{ success: true; data: HomepageSection }>(
    '/admin/homepage-sections',
    {
      method: 'POST',
      body: JSON.stringify(section),
      credentials: 'include',
    },
  );
  return response.data;
}

export async function updateHomepageSection(
  id: string,
  section: Partial<CreateHomepageSectionInput>,
): Promise<HomepageSection> {
  const response = await request<{ success: true; data: HomepageSection }>(
    `/admin/homepage-sections/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(section),
      credentials: 'include',
    },
  );
  return response.data;
}

export async function updateHomepageSectionStatus(
  id: string,
  isActive: boolean,
): Promise<HomepageSection> {
  const response = await request<{ success: true; data: HomepageSection }>(
    `/admin/homepage-sections/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
      credentials: 'include',
    },
  );
  return response.data;
}

export async function deleteHomepageSection(id: string): Promise<void> {
  await request<{ success: true; data: { id: string } }>(
    `/admin/homepage-sections/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
    },
  );
}

export async function uploadHomepageImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/admin/uploads/homepage-image`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError('Homepage image upload failed', response.status);
  }

  const result = (await response.json()) as {
    success: true;
    data: { url: string; publicId: string; altText: string };
  };

  return result.data;
}
