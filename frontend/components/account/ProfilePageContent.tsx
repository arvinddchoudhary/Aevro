'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { updateUserProfile } from '../../lib/api/users';
import { EmptyState } from '../ui/EmptyState';

export function ProfilePageContent() {
  const router = useRouter();
  const { reloadUser, status, user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      setIsSaving(true);
      await updateUserProfile({
        name,
        phone: phone.trim() || undefined,
      });
      await reloadUser();
      setMessage('Profile updated.');
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : 'Unable to update profile.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return <EmptyState title="Loading profile" message="Checking your account." />;
  }

  if (!user) {
    return <EmptyState title="Login required" message="Redirecting you to login." />;
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={submitProfile} className="border border-[#ddd4c8] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-[#777777]">
          Profile
        </p>
        <h1 className="mt-4 text-3xl font-light sm:text-4xl md:text-5xl">Your details</h1>
        <div className="mt-8 grid gap-5">
          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 w-full border border-[#ddd4c8] px-4 text-sm outline-none focus:border-[#111111]"
            />
          </label>
          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
              Phone
            </span>
            <input
              value={phone}
              inputMode="tel"
              onChange={(event) => setPhone(event.target.value)}
              className="h-11 w-full border border-[#ddd4c8] px-4 text-sm outline-none focus:border-[#111111]"
            />
          </label>
          <div className="border-t border-[#e7ded2] pt-5 text-sm">
            <div className="grid grid-cols-[130px_1fr] gap-4 py-2">
              <span className="text-[#777777]">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="grid grid-cols-[130px_1fr] gap-4 py-2">
              <span className="text-[#777777]">Verified</span>
              <span>{user.emailVerified ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
        {error && (
          <p className="mt-5 border border-[#8a1f1f] p-4 text-sm text-[#8a1f1f]">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-5 border border-[#1f6b3a] p-4 text-sm text-[#1f6b3a]">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="mt-6 h-12 cursor-pointer border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3] disabled:cursor-not-allowed disabled:border-[#ddd4c8] disabled:text-[#777777] disabled:hover:bg-[#fffaf3]"
        >
          {isSaving ? 'Saving' : 'Save profile'}
        </button>
      </form>

      <aside className="h-fit border border-[#ddd4c8] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
          Account
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/account/addresses"
            className="inline-flex h-12 cursor-pointer items-center justify-center border border-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3]"
          >
            Manage addresses
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex h-12 cursor-pointer items-center justify-center border border-[#ddd4c8] px-6 text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
          >
            View orders
          </Link>
        </div>
      </aside>
    </div>
  );
}
