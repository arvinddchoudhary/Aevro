'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getCurrentUser,
  googleLogin,
  login,
  logout,
  register,
  resendEmailOtp,
  sendLoginOtp,
  verifyEmailOtp,
  verifyLoginOtp,
} from './api/auth';
import type {
  AuthUser,
  GoogleLoginPayload,
  LoginOtpPayload,
  LoginPayload,
  RegisterPayload,
  RegisterResult,
  VerifyLoginOtpPayload,
} from '../types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  sendLoginOtp: (payload: LoginOtpPayload) => Promise<{
    email: string;
    sent: boolean;
    expiresInMinutes: number;
    resendCount?: number;
  }>;
  verifyLoginOtp: (payload: VerifyLoginOtpPayload) => Promise<AuthUser>;
  googleLogin: (payload: GoogleLoginPayload) => Promise<AuthUser>;
  verifyEmailOtp: (email: string, code: string) => Promise<AuthUser>;
  resendEmailOtp: (email: string) => Promise<{
    alreadyVerified: boolean;
    sent: boolean;
    expiresInMinutes: number;
    error?: string | null;
  }>;
  logout: () => Promise<void>;
  reloadUser: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const reloadUser = useCallback(async () => {
    setStatus('loading');
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setStatus(currentUser ? 'authenticated' : 'unauthenticated');

    return currentUser;
  }, []);

  useEffect(() => {
    void reloadUser();
  }, [reloadUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      register: async (payload) => {
        const result = await register(payload);
        setUser(null);
        setStatus('unauthenticated');

        return result;
      },
      login: async (payload) => {
        const nextUser = await login(payload);
        setUser(nextUser);
        setStatus('authenticated');

        return nextUser;
      },
      sendLoginOtp: async (payload) => {
        const result = await sendLoginOtp(payload);
        setUser(null);
        setStatus('unauthenticated');

        return result;
      },
      verifyLoginOtp: async (payload) => {
        const nextUser = await verifyLoginOtp(payload);
        setUser(nextUser);
        setStatus('authenticated');

        return nextUser;
      },
      googleLogin: async (payload) => {
        const nextUser = await googleLogin(payload);
        setUser(nextUser);
        setStatus('authenticated');

        return nextUser;
      },
      verifyEmailOtp: async (email, code) => {
        const nextUser = await verifyEmailOtp(email, code);
        setUser(nextUser);
        setStatus('authenticated');

        return nextUser;
      },
      resendEmailOtp,
      logout: async () => {
        await logout();
        setUser(null);
        setStatus('unauthenticated');
      },
      reloadUser,
    }),
    [reloadUser, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
