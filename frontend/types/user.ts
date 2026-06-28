import type { AuthUser } from './auth';

export type UserProfile = AuthUser;

export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
};

export type UserAddress = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressPayload = {
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type UserItemResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };

export type UserCollectionResponse<T> =
  | {
      success: true;
      data: T[];
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };
