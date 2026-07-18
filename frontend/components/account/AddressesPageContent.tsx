'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
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
import { AccountBenefitBar } from './AccountBenefitBar';
import { AccountHero } from './AccountHero';
import { AccountIcon } from './AccountIcons';
import { AccountSidebar } from './AccountSidebar';
import { AddressCard } from './AddressCard';
import { AddressFormModal } from './AddressFormModal';

const emptyAddress: AddressPayload = {
  label: 'Home',
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
    label: address.label,
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

function normalizePayload(payload: AddressPayload): AddressPayload {
  return {
    label: payload.label?.trim() || 'Home',
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    addressLine1: payload.addressLine1.trim(),
    addressLine2: payload.addressLine2?.trim() || undefined,
    city: payload.city.trim(),
    state: payload.state.trim(),
    postalCode: payload.postalCode.trim(),
    country: payload.country.trim() || 'India',
  };
}

export function AddressesPageContent() {
  const router = useRouter();
  const { logout, status, user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [formValues, setFormValues] = useState<AddressPayload>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSetDefault, setIsSetDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const closeForm = () => {
    setEditingId(null);
    setFormValues(emptyAddress);
    setFormError(null);
    setIsSetDefault(false);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormValues(emptyAddress);
    setFormError(null);
    setIsSetDefault(addresses.length === 0);
    setIsFormOpen(true);
  };

  const openEditForm = (address: UserAddress) => {
    setEditingId(address.id);
    setFormValues(toPayload(address));
    setFormError(null);
    setIsSetDefault(address.isDefault);
    setIsFormOpen(true);
  };

  const updateField = (name: keyof AddressPayload, value: string) => {
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setFormError(null);
    setMessage(null);
  };

  const submitAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFormError(null);
    setMessage(null);

    try {
      setIsSaving(true);
      const payload = normalizePayload(formValues);
      const savedAddress = editingId
        ? await updateUserAddress(editingId, payload)
        : await createUserAddress(payload);

      if (isSetDefault && !savedAddress.isDefault) {
        await setDefaultUserAddress(savedAddress.id);
      }

      setMessage(editingId ? 'Address updated.' : 'Address saved.');
      closeForm();
      await loadAddresses();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Unable to save address.');
    } finally {
      setIsSaving(false);
    }
  };

  const makeDefault = async (address: UserAddress) => {
    try {
      setError(null);
      setMessage(null);
      await setDefaultUserAddress(address.id);
      setMessage(`${address.label} is now your default address.`);
      await loadAddresses();
    } catch (defaultError) {
      setError(
        defaultError instanceof Error
          ? defaultError.message
          : 'Unable to update default address.',
      );
    }
  };

  const removeAddress = async (address: UserAddress) => {
    const confirmed = window.confirm(`Delete ${address.label} address?`);

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      setMessage(null);
      await deleteUserAddress(address.id);
      if (editingId === address.id) {
        closeForm();
      }
      setMessage('Address removed.');
      await loadAddresses();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Unable to delete address.',
      );
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (status === 'loading') {
    return <EmptyState title="Loading addresses" message="Checking your account." />;
  }

  if (!user) {
    return <EmptyState title="Login required" message="Redirecting you to login." />;
  }

  return (
    <div className="bg-[#fbf7f0]">
      <AccountHero
        title="Addresses"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/account' },
          { label: 'Addresses' },
        ]}
      />

      <section className="aevro-container py-3 sm:py-8 lg:py-10">
        <div className="grid gap-3 sm:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[315px_minmax(0,1fr)]">
          <AccountSidebar isLoggingOut={isLoggingOut} onLogout={handleLogout} />

          <section className="min-w-0 rounded-[8px] border border-[#e1d8cc] bg-[#fffaf3]/82 p-4 shadow-[0_20px_60px_rgba(48,38,27,0.04)] sm:p-7 lg:rounded-none">
            <div className="flex flex-col gap-4 border-b border-[#e5dbcf] pb-5 lg:flex-row lg:items-start lg:justify-between lg:pb-6">
              <div>
                <h1 className="font-serif text-2xl font-light text-[#111111] sm:text-3xl">
                  My Saved Addresses
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#625a51] sm:mt-3">
                  Manage your shipping addresses for a faster checkout experience.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[3px] bg-[#111111] px-5 text-xs font-medium uppercase tracking-[0.1em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:h-12 sm:w-auto sm:px-6 sm:text-sm"
                style={{ color: '#fffaf3' }}
              >
                <AccountIcon name="plus" className="h-4 w-4" />
                Add New Address
              </button>
            </div>

            {message && (
              <p className="mt-5 border border-[#b9d0bd] bg-[#fbfff9] p-4 text-sm text-[#2d6439]">
                {message}
              </p>
            )}

            {isLoading && (
              <div className="mt-6">
                <EmptyState
                  title="Loading addresses"
                  message="Fetching your saved addresses."
                />
              </div>
            )}

            {error && !isLoading && (
              <div className="mt-6">
                <ErrorState title="Address request failed" message={error} />
              </div>
            )}

            {!isLoading && !error && addresses.length === 0 && (
              <div className="mt-5 rounded-[6px] border border-[#e5dbcf] bg-[#fffdf8] p-6 text-center sm:mt-6 sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e8de] text-[#211d18]">
                  <AccountIcon name="address" className="h-8 w-8" />
                </div>
                <h2 className="mt-5 font-serif text-2xl font-light text-[#111111]">
                  No saved addresses yet.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#625a51]">
                  Add an address to make checkout faster.
                </p>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924] sm:w-auto"
                  style={{ color: '#fffaf3' }}
                >
                  Add New Address
                </button>
              </div>
            )}

            {!isLoading && !error && addresses.length > 0 && (
              <div className="mt-6 space-y-4">
                {addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    onDelete={removeAddress}
                    onEdit={openEditForm}
                    onSetDefault={makeDefault}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <AccountBenefitBar />

      <AddressFormModal
        error={formError}
        formValues={formValues}
        isOpen={isFormOpen}
        isSaving={isSaving}
        isSetDefault={isSetDefault}
        mode={editingId ? 'edit' : 'create'}
        onCancel={closeForm}
        onFieldChange={updateField}
        onSetDefaultChange={setIsSetDefault}
        onSubmit={submitAddress}
      />
    </div>
  );
}
