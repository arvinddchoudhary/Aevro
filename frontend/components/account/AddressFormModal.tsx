'use client';

import type { FormEvent } from 'react';
import type { AddressPayload } from '../../types/user';
import type { LocationAddress } from '../../lib/api/location';
import { PincodeAutofillField } from '../location/PincodeAutofillField';

type AddressFormModalProps = {
  error: string | null;
  formValues: AddressPayload;
  isOpen: boolean;
  isSaving: boolean;
  isSetDefault: boolean;
  mode: 'create' | 'edit';
  onCancel: () => void;
  onFieldChange: (name: keyof AddressPayload, value: string) => void;
  onPincodeFound: (address: LocationAddress) => void;
  onSetDefaultChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const fields = [
  ['label', 'Label'],
  ['fullName', 'Full Name'],
  ['phone', 'Phone'],
  ['addressLine1', 'Address Line 1'],
  ['addressLine2', 'Address Line 2'],
  ['city', 'City'],
  ['state', 'State'],
  ['country', 'Country'],
] as Array<[keyof AddressPayload, string]>;

export function AddressFormModal({
  error,
  formValues,
  isOpen,
  isSaving,
  isSetDefault,
  mode,
  onCancel,
  onFieldChange,
  onPincodeFound,
  onSetDefaultChange,
  onSubmit,
}: AddressFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-[#111111]/36 px-0 py-0 backdrop-blur-sm sm:items-center sm:justify-center sm:px-4 sm:py-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-form-title"
    >
      <div className="max-h-[100vh] w-full overflow-y-auto border border-[#ded4c8] bg-[#fffaf3] p-4 shadow-[0_32px_90px_rgba(17,17,17,0.2)] sm:max-h-[92vh] sm:max-w-3xl sm:p-7">
        <div className="flex flex-col gap-3 border-b border-[#e5dbcf] pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#777067]">
              Address Book
            </p>
            <h2
              id="address-form-title"
              className="mt-2 font-serif text-2xl font-light text-[#111111] sm:text-3xl"
            >
              {mode === 'edit' ? 'Edit Address' : 'Add New Address'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 border border-[#ddd4c8] px-4 text-xs font-medium uppercase tracking-[0.08em] transition hover:border-[#111111]"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(([name, label]) => {
              const isWide = name === 'addressLine1' || name === 'addressLine2';

              return (
                <label key={name} className={isWide ? 'sm:col-span-2' : undefined}>
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#777067]">
                    {label}
                    {name === 'addressLine2' && (
                      <span className="ml-2 font-normal normal-case tracking-normal">
                        Optional
                      </span>
                    )}
                  </span>
                  <input
                    value={formValues[name] ?? ''}
                    onChange={(event) => onFieldChange(name, event.target.value)}
                    className="h-11 w-full border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
                  />
                </label>
              );
            })}
            <PincodeAutofillField
              value={formValues.postalCode ?? ''}
              onChange={(value) => onFieldChange('postalCode', value)}
              onAddressFound={onPincodeFound}
            />
          </div>

          <label className="mt-5 flex items-center gap-3 text-sm text-[#2f2a25]">
            <input
              type="checkbox"
              checked={isSetDefault}
              onChange={(event) => onSetDefaultChange(event.target.checked)}
              className="h-4 w-4 accent-[#111111]"
            />
            Set as default address
          </label>

          {error && (
            <p className="mt-5 border border-[#8a1f1f] bg-[#fff8f5] p-4 text-sm text-[#8a1f1f]">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="h-12 border border-[#ddd4c8] px-6 text-sm font-medium uppercase tracking-[0.08em] transition hover:border-[#111111]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-12 bg-[#111111] px-6 text-sm font-medium uppercase tracking-[0.08em] text-[#fffaf3] transition hover:bg-[#2d2924] disabled:cursor-not-allowed disabled:bg-[#9a9187]"
              style={{ color: '#fffaf3' }}
            >
              {isSaving ? 'Saving' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
