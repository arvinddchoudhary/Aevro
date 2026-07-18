'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { renderGoogleSignInButton } from '../../lib/google';
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
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const container = buttonContainerRef.current;

    if (!googleClientId || !container) {
      if (!googleClientId) {
        onError('Google login is not configured.');
      }
      return;
    }

    let cancelled = false;

    const handleCredential = async (idToken: string) => {
      if (cancelled) {
        return;
      }

      setIsLoading(true);
      try {
        await googleLogin({ idToken });
        router.push(redirectTo);
        router.refresh();
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Google login failed.');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void renderGoogleSignInButton({
      clientId: googleClientId,
      container,
      onCredential: handleCredential,
    })
      .then(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          onError(error instanceof Error ? error.message : 'Unable to load Google login.');
        }
      });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
  }, [googleClientId, googleLogin, onError, redirectTo, router]);

  return (
    <div className="relative min-h-14">
      <div
        ref={buttonContainerRef}
        className="flex min-h-14 w-full items-center justify-center"
        aria-label="Continue with Google"
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center border border-[#cfc7bc] bg-[#fffaf3] text-xs font-semibold uppercase tracking-[0.16em] text-[#777777]">
          Loading Google
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#111111] text-xs font-semibold uppercase tracking-[0.16em] text-white">
          Signing in
        </div>
      )}
    </div>
  );
}
