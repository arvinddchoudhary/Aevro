'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { requestGoogleIdToken } from '../../lib/google';
import { useAuth } from '../../lib/auth';

type GoogleLoginButtonProps = {
  onError: (message: string) => void;
  redirectTo?: string;
};

export function GoogleLoginButton({
  onError,
  redirectTo = '/account',
}: GoogleLoginButtonProps) {
  const router = useRouter();
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleGoogleLogin = async () => {
    if (!googleClientId) {
      onError('Google login is not configured.');
      return;
    }

    setIsLoading(true);

    try {
      const idToken = await requestGoogleIdToken(googleClientId);
      await googleLogin({ idToken });
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Google login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={handleGoogleLogin}
      className="h-12 w-full border border-[#ddd4c8] text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#777777]"
    >
      {isLoading ? 'Opening Google' : 'Continue with Google'}
    </button>
  );
}
