'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { AuthField } from './AuthField';
import { GoogleLoginButton } from './GoogleLoginButton';

export function RegisterForm() {
  const router = useRouter();
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await register({ name, email, password });
      const delivery = result.emailVerification;
      setIsOtpStep(true);
      setOtpMessage(
        delivery?.sent
          ? `We sent a 6-digit verification code to your email. It expires in ${delivery.expiresInMinutes} minutes.`
          : delivery?.error ??
              'Account created, but the verification email could not be sent. Please use resend code.',
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
      await verifyEmailOtp(otpCode);
      router.push('/account');
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
      const result = await resendEmailOtp();
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

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        onSubmit={isOtpStep ? handleVerifyOtp : handleSubmit}
        className="border border-[#ddd4c8] bg-[#fffaf3]/70 p-5 sm:p-8"
      >
        <p className="text-xs uppercase tracking-[0.14em] text-[#77716a]">
          {isOtpStep ? 'Verify email' : 'Create account'}
        </p>
        <h1 className="mt-4 text-3xl font-light uppercase sm:text-4xl">
          {isOtpStep ? 'Enter your verification code.' : 'Start your AEVRO profile.'}
        </h1>
        {isOtpStep ? (
          <>
            <p className="mt-4 text-sm leading-6 text-[#5f5a53]">
              Enter the 6-digit code for {email}. If it did not arrive, use resend
              code.
            </p>
            <div className="mt-6">
              <AuthField
                label="Verification code"
                name="otp"
                value={otpCode}
                autoComplete="one-time-code"
                onChange={(value) => setOtpCode(value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 space-y-5 sm:mt-8">
              <AuthField
                label="Name"
                name="name"
                value={name}
                autoComplete="name"
                onChange={setName}
              />
              <AuthField
                label="Email"
                name="email"
                type="email"
                value={email}
                autoComplete="email"
                onChange={setEmail}
              />
              <AuthField
                label="Password"
                name="password"
                type="password"
                value={password}
                autoComplete="new-password"
                onChange={setPassword}
              />
            </div>
            <p className="mt-4 text-xs leading-5 text-[#777777]">
              Use at least 8 characters. Tokens are stored by the backend in
              httpOnly cookies, never in browser storage.
            </p>
          </>
        )}
        {otpMessage && (
          <p className="mt-5 border border-[#1f6b3a] p-3 text-sm leading-6 text-[#1f6b3a]">
            {otpMessage}
          </p>
        )}
        {error && <p className="mt-5 text-sm leading-6 text-[#8a1f1f]">{error}</p>}
        <button
          disabled={isSubmitting || isVerifying || (isOtpStep && otpCode.length !== 6)}
          className="mt-6 h-12 w-full bg-[#111111] text-xs font-medium uppercase tracking-[0.08em] text-[#fffaf3] hover:bg-[#2a2825] disabled:cursor-not-allowed disabled:border disabled:border-[#ddd4c8] disabled:bg-transparent disabled:text-[#777777]"
        >
          {isOtpStep
            ? isVerifying
              ? 'Verifying'
              : 'Verify email'
            : isSubmitting
              ? 'Creating account'
              : 'Create account'}
        </button>
        {isOtpStep ? (
          <button
            type="button"
            disabled={isResending}
            onClick={() => void handleResendOtp()}
            className="mt-3 h-11 w-full cursor-pointer border border-[#ddd4c8] text-xs font-medium uppercase tracking-[0.08em] hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#777777]"
          >
            {isResending ? 'Sending code' : 'Resend code'}
          </button>
        ) : (
          <>
            <div className="my-5 border-t border-[#ddd4c8]" />
            <GoogleLoginButton onError={setError} />
          </>
        )}
      </form>
      <p className="mt-5 text-center text-sm text-[#5f5a53]">
        Already have an account?{' '}
        <Link href="/login" className="underline underline-offset-4">
          Login
        </Link>
      </p>
    </div>
  );
}
