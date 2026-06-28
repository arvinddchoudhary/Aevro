export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmailVerificationDelivery = {
  sent: boolean;
  expiresInMinutes: number;
  error?: string | null;
};

export type RegisterResult = {
  user: AuthUser;
  emailVerification?: EmailVerificationDelivery;
};

export type AuthResponse =
  | {
      success: true;
      data: {
        user: AuthUser;
        emailVerification?: EmailVerificationDelivery;
      };
    }
  | {
      success: false;
      statusCode?: number;
      message: string | string[];
    };

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type GoogleLoginPayload = {
  idToken: string;
};
