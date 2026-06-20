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
} from './api/auth';
import type {
  AuthUser,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
} from '../types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  googleLogin: (payload: GoogleLoginPayload) => Promise<AuthUser>;
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
        const nextUser = await register(payload);
        setUser(nextUser);
        setStatus('authenticated');

        return nextUser;
      },
      login: async (payload) => {
        const nextUser = await login(payload);
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
