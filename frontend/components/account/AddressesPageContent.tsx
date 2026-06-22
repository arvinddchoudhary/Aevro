'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  createUserAddress,
  deleteUserAddress,
  getUserAddresses,
  setDefaultUserAddress,
  updateUserAddress,
} from '../../lib/api/users';
import { useAuth } from '../../lib/auth';
import type { AddressPayload, UserAddress } from '../../types/user';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

const emptyAddress: AddressPayload = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

function toPayload(address: UserAddress): AddressPayload {
  return {
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };
}

export function AddressesPageContent() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [formValues, setFormValues] = useState<AddressPayload>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const editingAddress = useMemo(
    () => addresses.find((address) => address.id === editingId) ?? null,
    [addresses, editingId],
  );

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAddresses(await getUserAddresses());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load addresses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }

    if (status === 'authenticated') {
      void loadAddresses();
    }
  }, [router, status]);

  const updateField = (name: keyof AddressPayload, value: string) => {
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setMessage(null);
    setError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormValues(emptyAddress);
  };

  const startEditing = (address: UserAddress) => {
    setEditingId(address.id);
    setFormValues(toPayload(address));
    setMessage(null);
    setError(null);
  };

  const submitAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    try {
      setIsSaving(true);
      if (editingId) {
        await updateUserAddress(editingId, formValues);
        setMessage('Address updated.');
      } else {
        await createUserAddress(formValues);
        setMessage('Address saved.');
      }
      resetForm();
      await loadAddresses();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  const makeDefault = async (addressId: string) => {
    try {
      setError(null);
      setMessage(null);
      await setDefaultUserAddress(addressId);
      setMessage('Default address updated.');
      await loadAddresses();
    } catch (defaultError) {
      setError(
        defaultError instanceof Error
          ? defaultError.message
          : 'Unable to update default address.',
      );
    }
  };

  const removeAddress = async (addressId: string) => {
    try {
      setError(null);
      setMessage(null);
      await deleteUserAddress(addressId);
      if (editingId === addressId) {
        resetForm();
      }
      setMessage('Address removed.');
      await loadAddresses();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Unable to delete address.',
      );
    }
  };

  if (status === 'loading') {
    return <EmptyState title="Loading addresses" message="Checking your account." />;
  }

  if (!user) {
    return <EmptyState title="Login required" message="Redirecting you to login." />;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section>
        <div className="mb-8 border-b border-[#ddd4c8] pb-6">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#777777]">
            Account
          </p>
          <h1 className="text-4xl font-light md:text-5xl">Addresses</h1>
          <Link
            href="/account/profile"
            className="mt-5 inline-flex cursor-pointer text-sm underline underline-offset-4"
          >
            Back to profile
          </Link>
        </div>

        {isLoading && <EmptyState title="Loading addresses" message="Fetching saved addresses." />}
        {error && !isLoading && <ErrorState title="Address request failed" message={error} />}
        {!isLoading && addresses.length === 0 && !error && (
          <EmptyState title="No saved addresses" message="Add a shipping address for faster checkout." />
        )}

        <div className="space-y-4">
          {addresses.map((address) => (
            <article key={address.id} className="border border-[#ddd4c8] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg">{address.fullName}</p>
                    {address.isDefault && (
                      <span className="border border-[#111111] px-3 py-1 text-xs uppercase tracking-[0.14em]">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[#5f5a53]">{address.phone}</p>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f5a53]">
                    {address.addressLine1}
                    {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.country}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => void makeDefault(address.id)}
                      className="h-10 cursor-pointer border border-[#ddd4c8] px-4 text-xs uppercase tracking-[0.1em] hover:border-[#111111]"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEditing(address)}
                    className="h-10 cursor-pointer border border-[#111111] px-4 text-xs uppercase tracking-[0.1em] hover:bg-[#111111] hover:text-[#fffaf3]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void removeAddress(address.id)}
                    className="h-10 cursor-pointer border border-[#ddd4c8] px-4 text-xs uppercase tracking-[0.1em] hover:border-[#111111]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="h-fit border border-[#ddd4c8] p-6 lg:sticky lg:top-24">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">
          {editingAddress ? 'Edit address' : 'New address'}
        </p>
        <form onSubmit={submitAddress} className="mt-6 grid gap-4">
          {(
            [
              ['fullName', 'Full name'],
              ['phone', 'Phone'],
              ['addressLine1', 'Address line 1'],
              ['addressLine2', 'Address line 2'],
              ['city', 'City'],
              ['state', 'State'],
              ['postalCode', 'Postal code'],
              ['country', 'Country'],
            ] as Array<[keyof AddressPayload, string]>
          ).map(([name, label]) => (
            <label key={name}>
              <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
                {label}
              </span>
              <input
                value={formValues[name] ?? ''}
                onChange={(event) => updateField(name, event.target.value)}
                className="h-11 w-full border border-[#ddd4c8] px-4 text-sm outline-none focus:border-[#111111]"
              />
            </label>
          ))}
          {error && (
            <p className="border border-[#8a1f1f] p-4 text-sm text-[#8a1f1f]">
              {error}
            </p>
          )}
          {message && (
            <p className="border border-[#1f6b3a] p-4 text-sm text-[#1f6b3a]">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="h-12 cursor-pointer border border-[#111111] text-sm font-medium uppercase tracking-[0.08em] hover:bg-[#111111] hover:text-[#fffaf3] disabled:cursor-not-allowed disabled:border-[#ddd4c8] disabled:text-[#777777] disabled:hover:bg-[#fffaf3]"
          >
            {isSaving ? 'Saving' : editingId ? 'Update address' : 'Save address'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="h-12 cursor-pointer border border-[#ddd4c8] text-sm font-medium uppercase tracking-[0.08em] hover:border-[#111111]"
            >
              Cancel edit
            </button>
          )}
        </form>
      </aside>
    </div>
  );
}
