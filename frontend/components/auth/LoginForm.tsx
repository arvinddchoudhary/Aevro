'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { AuthCard } from './AuthCard';
import { AuthDivider } from './AuthDivider';
import { AuthInput } from './AuthInput';
import { GoogleLoginButton } from './GoogleLoginButton';

type LoginMethod = 'password' | 'otp';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, sendLoginOtp, verifyLoginOtp } = useAuth();
  const [method, setMethod] = useState<LoginMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const redirectTo = searchParams.get('redirect') || '/account';

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setResendCooldown((currentValue) => Math.max(0, currentValue - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [resendCooldown]);

  const completeLogin = () => {
    router.push(redirectTo);
    router.refresh();
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      completeLogin();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Login failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const result = await sendLoginOtp({ email });
      setIsOtpStep(true);
      setResendCooldown(60);
      setMessage(`Enter the OTP sent to your email. It expires in ${result.expiresInMinutes} minutes.`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to send OTP.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await verifyLoginOtp({ email, code: otpCode });
      completeLogin();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'OTP login failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setMessage(null);
    setIsResending(true);

    try {
      const result = await sendLoginOtp({ email });
      setResendCooldown(60);
      setMessage(`A new OTP was sent. It expires in ${result.expiresInMinutes} minutes.`);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Unable to resend OTP.',
      );
    } finally {
      setIsResending(false);
    }
  };

  const selectMethod = (nextMethod: LoginMethod) => {
    setMethod(nextMethod);
    setError(null);
    setMessage(null);
    setOtpCode('');
    setIsOtpStep(false);
    setResendCooldown(0);
  };

  return (
    <AuthCard
      eyebrow="Customer login"
      title="Welcome back."
      subtitle="Sign in to continue to AEVRO."
      footer={
        <p className="text-sm text-[#6d665e]">
          New to AEVRO?{' '}
          <Link
            href={redirectTo === '/account' ? '/register' : `/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-semibold uppercase tracking-[0.14em] text-[#111111] underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <form
        onSubmit={
          method === 'password'
            ? handlePasswordSubmit
            : isOtpStep
              ? handleVerifyOtp
              : handleSendOtp
        }
        className="w-full"
      >
        <div className="grid grid-cols-2 border border-[#cfc7bc] p-1">
          <button
            type="button"
            onClick={() => selectMethod('password')}
            className={`h-10 text-xs font-medium uppercase tracking-[0.1em] ${
              method === 'password'
                ? 'bg-[#111111] text-[#fffaf3]'
                : 'text-[#514c45] hover:bg-[#efe6da]'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => selectMethod('otp')}
            className={`h-10 text-xs font-medium uppercase tracking-[0.1em] ${
              method === 'otp'
                ? 'bg-[#111111] text-[#fffaf3]'
                : 'text-[#514c45] hover:bg-[#efe6da]'
            }`}
          >
            OTP
          </button>
        </div>
        <div className="mt-7 space-y-6">
          <AuthInput
            label="Email address"
            name="email"
            type="email"
            value={email}
            placeholder="e.g. hello@aevro.com"
            autoComplete="email"
            onChange={setEmail}
          />
          {method === 'password' ? (
            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#111111]">
                  Password
                </span>
                <span className="text-xs text-[#6d665e] underline underline-offset-4">
                  Forgot Password?
                </span>
              </div>
              <AuthInput
                label=""
                name="password"
                type="password"
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                onChange={setPassword}
              />
            </div>
          ) : isOtpStep ? (
            <AuthInput
              label="Verification code"
              name="otp"
              value={otpCode}
              placeholder="Enter 6-digit OTP"
              autoComplete="one-time-code"
              onChange={(value) => setOtpCode(value.replace(/\D/g, '').slice(0, 6))}
            />
          ) : (
            <p className="text-sm leading-6 text-[#5f5a53]">
              We will send a 6-digit OTP to your account email.
            </p>
          )}
        </div>
        {message && (
          <p className="mt-5 border border-[#1f6b3a] p-3 text-sm leading-6 text-[#1f6b3a]">
            {message}
          </p>
        )}
        {error && <p className="mt-5 text-sm leading-6 text-[#8a1f1f]">{error}</p>}
        <button
          disabled={isSubmitting || (method === 'otp' && isOtpStep && otpCode.length !== 6)}
          className="mt-7 h-14 w-full bg-[#111111] text-xs font-semibold uppercase tracking-[0.18em] text-[#fffaf3] transition hover:bg-[#2a2825] disabled:cursor-not-allowed disabled:border disabled:border-[#ddd4c8] disabled:bg-transparent disabled:text-[#777777]"
        >
          {method === 'password'
            ? isSubmitting
              ? 'Logging in'
              : 'Login'
            : isOtpStep
              ? isSubmitting
                ? 'Verifying OTP'
                : 'Verify OTP & Login'
              : isSubmitting
                ? 'Sending OTP'
                : 'Send OTP'}
        </button>
        {method === 'otp' && isOtpStep && (
          <button
            type="button"
            disabled={isResending || resendCooldown > 0}
            onClick={() => void handleResendOtp()}
            className="mt-3 h-11 w-full cursor-pointer border border-[#ddd4c8] text-xs font-medium uppercase tracking-[0.08em] hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#777777]"
          >
            {isResending
              ? 'Sending OTP'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
            : 'Resend OTP'}
          </button>
        )}
        <AuthDivider />
        <GoogleLoginButton onError={setError} redirectTo={redirectTo} />
      </form>
    </AuthCard>
  );
}
