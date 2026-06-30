'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { AuthCard } from './AuthCard';
import { AuthDivider } from './AuthDivider';
import { AuthInput } from './AuthInput';
import { GoogleLoginButton } from './GoogleLoginButton';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, resendEmailOtp, verifyEmailOtp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await register({ name, email, password });
      const delivery = result.emailVerification;
      setIsOtpStep(true);
      setResendCooldown(60);
      setOtpMessage(
        delivery?.sent
          ? `Enter the OTP sent to your email. It expires in ${delivery.expiresInMinutes} minutes.`
          : delivery?.error ??
              'The verification email could not be sent. Please use resend code.',
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Registration failed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setOtpMessage(null);
    setIsVerifying(true);

    try {
      await verifyEmailOtp(email, otpCode);
      router.push(redirectTo);
      router.refresh();
    } catch (verifyError) {
      setError(
        verifyError instanceof Error ? verifyError.message : 'OTP verification failed.',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setOtpMessage(null);
    setIsResending(true);

    try {
      const result = await resendEmailOtp(email);
      if (result.sent) {
        setResendCooldown(60);
      }
      setOtpMessage(
        result.alreadyVerified
          ? 'This email is already verified.'
          : result.sent
            ? `A new code was sent. It expires in ${result.expiresInMinutes} minutes.`
            : result.error ??
              'The verification email could not be sent. Please try again.',
      );
    } catch (resendError) {
      setError(
        resendError instanceof Error ? resendError.message : 'Unable to resend OTP.',
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    setIsOtpStep(false);
    setOtpCode('');
    setOtpMessage(null);
    setError(null);
    setResendCooldown(0);
  };

  return (
    <AuthCard
      eyebrow={isOtpStep ? 'Email verification' : 'Create account'}
      title={isOtpStep ? 'Verify your email.' : 'Create your account.'}
      subtitle={
        isOtpStep
          ? `Enter the code sent to ${email}.`
          : 'Join AEVRO and continue your order.'
      }
      footer={
        <p className="text-sm text-[#6d665e]">
          Already have an account?{' '}
          <Link
            href={redirectTo === '/account' ? '/login' : `/login?redirect=${encodeURIComponent(redirectTo)}`}
            className="font-semibold uppercase tracking-[0.14em] text-[#111111] underline underline-offset-4"
          >
            Login
          </Link>
        </p>
      }
      compact
    >
      <form
        onSubmit={isOtpStep ? handleVerifyOtp : handleSubmit}
        className="w-full"
      >
        {isOtpStep ? (
          <>
            <div className="space-y-4">
              <AuthInput
                label="Verification code"
                name="otp"
                value={otpCode}
                placeholder="Enter 6-digit OTP"
                autoComplete="one-time-code"
                onChange={(value) => setOtpCode(value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <AuthInput
                label="Name"
                name="name"
                value={name}
                placeholder="Your name"
                autoComplete="name"
                onChange={setName}
              />
              <AuthInput
                label="Email address"
                name="email"
                type="email"
                value={email}
                placeholder="e.g. hello@aevro.com"
                autoComplete="email"
                onChange={setEmail}
              />
              <AuthInput
                label="Password"
                name="password"
                type="password"
                value={password}
                placeholder="Create a password"
                autoComplete="new-password"
                onChange={setPassword}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-[#6d665e]">
              Use at least 8 characters. Your session is handled with httpOnly
              cookies after email verification.
            </p>
          </>
        )}
        {otpMessage && (
          <p className="mt-4 border border-[#1f6b3a] p-3 text-sm leading-6 text-[#1f6b3a]">
            {otpMessage}
          </p>
        )}
        {error && <p className="mt-4 text-sm leading-6 text-[#8a1f1f]">{error}</p>}
        <button
          disabled={isSubmitting || isVerifying || (isOtpStep && otpCode.length !== 6)}
          className="mt-5 h-12 w-full bg-[#111111] text-xs font-semibold uppercase tracking-[0.18em] text-[#fffaf3] transition hover:bg-[#2a2825] disabled:cursor-not-allowed disabled:border disabled:border-[#ddd4c8] disabled:bg-transparent disabled:text-[#777777]"
        >
          {isOtpStep
            ? isVerifying
              ? 'Verifying'
              : 'Verify email'
            : isSubmitting
              ? 'Sending OTP'
              : 'Send OTP'}
        </button>
        {isOtpStep ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isResending || resendCooldown > 0}
              onClick={() => void handleResendOtp()}
              className="h-11 cursor-pointer border border-[#cfc7bc] text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#777777]"
            >
              {isResending
                ? 'Sending'
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend OTP'}
            </button>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="h-11 cursor-pointer border border-[#cfc7bc] text-xs font-semibold uppercase tracking-[0.12em] transition hover:border-[#111111]"
            >
              Change email
            </button>
          </div>
        ) : (
          <>
            <AuthDivider />
            <GoogleLoginButton onError={setError} redirectTo={redirectTo} />
          </>
        )}
      </form>
    </AuthCard>
  );
}
