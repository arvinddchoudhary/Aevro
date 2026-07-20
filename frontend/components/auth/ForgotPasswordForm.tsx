'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetPassword, sendPasswordResetOtp, verifyPasswordResetOtp } from '../../lib/api/auth';
import { AuthCard } from './AuthCard';
import { AuthInput } from './AuthInput';

type Step = 'email' | 'otp' | 'password';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); setMessage(null); setIsSubmitting(true);
    try {
      if (step === 'email') {
        const result = await sendPasswordResetOtp(email);
        setStep('otp'); setMessage(`Enter the OTP sent to ${result.email}.`);
      } else if (step === 'otp') {
        const result = await verifyPasswordResetOtp(email, code);
        setResetToken(result.resetToken); setStep('password');
      } else {
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        await resetPassword(email, resetToken, password);
        router.push('/login?passwordReset=1'); router.refresh();
      }
    } catch (value) { setError(value instanceof Error ? value.message : 'Unable to reset password.'); }
    finally { setIsSubmitting(false); }
  };

  return <AuthCard eyebrow="Password recovery" title="Reset your password." subtitle={step === 'email' ? 'Enter the email used for your AEVRO account.' : step === 'otp' ? 'Verify the OTP we sent to your email.' : 'Choose a new secure password.'} footer={<p className="text-sm text-[#6d665e]">Remembered it? <Link href="/login" className="font-semibold uppercase tracking-[0.14em] text-[#111111] underline underline-offset-4">Login</Link></p>} compact>
    <form onSubmit={submit} className="w-full space-y-5">
      {step === 'email' && <AuthInput label="Email address" name="email" type="email" value={email} autoComplete="email" onChange={setEmail} />}
      {step === 'otp' && <AuthInput label="Verification code" name="otp" value={code} placeholder="Enter 6-digit OTP" autoComplete="one-time-code" onChange={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))} />}
      {step === 'password' && <><AuthInput label="New password" name="password" type="password" value={password} autoComplete="new-password" onChange={setPassword} /><AuthInput label="Confirm password" name="confirmPassword" type="password" value={confirmPassword} autoComplete="new-password" onChange={setConfirmPassword} /></>}
      {message && <p className="border border-[#1f6b3a] p-3 text-sm leading-6 text-[#1f6b3a]">{message}</p>}
      {error && <p className="text-sm leading-6 text-[#8a1f1f]">{error}</p>}
      <button disabled={isSubmitting || (step === 'otp' && code.length !== 6) || (step === 'password' && password.length < 8)} className="h-14 w-full bg-[#111111] text-xs font-semibold uppercase tracking-[0.18em] text-[#fffaf3] disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? 'Please wait' : step === 'email' ? 'Send OTP' : step === 'otp' ? 'Verify OTP' : 'Reset password'}</button>
    </form>
  </AuthCard>;
}
