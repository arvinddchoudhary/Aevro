'use client';

import { useEffect, useRef, useState } from 'react';
import { lookupPincode, type LocationAddress } from '../../lib/api/location';

type PincodeAutofillFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onAddressFound: (address: LocationAddress) => void;
};

export function PincodeAutofillField({
  value,
  error,
  onChange,
  onAddressFound,
}: PincodeAutofillFieldProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const lastLookedUpPincode = useRef('');

  useEffect(() => {
    if (!/^\d{6}$/.test(value) || value === lastLookedUpPincode.current) {
      if (value.length < 6) {
        setStatus('idle');
        setMessage('');
      }
      return;
    }

    const timeout = window.setTimeout(() => {
      setStatus('loading');
      setMessage('Checking pincode…');
      void lookupPincode(value)
        .then((address) => {
          lastLookedUpPincode.current = value;
          onAddressFound(address);
          setStatus('success');
          setMessage('City and state have been filled. You can edit them if needed.');
        })
        .catch((lookupError: unknown) => {
          lastLookedUpPincode.current = value;
          setStatus('error');
          setMessage(lookupError instanceof Error ? lookupError.message : 'Enter a valid Indian pincode.');
        });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [onAddressFound, value]);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#777067]">
        Pincode
      </span>
      <input
        value={value}
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={6}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
        className="h-10 w-full border border-[#ddd4c8] bg-[#fffdf8] px-4 text-sm text-[#111111] outline-none transition focus:border-[#111111]"
      />
      {error && <p className="mt-2 text-sm text-[#8a1f1f]">{error}</p>}
      {message && (
        <p
          className={`mt-2 text-xs leading-5 ${status === 'error' ? 'text-[#8a1f1f]' : 'text-[#514c45]'}`}
          role={status === 'error' ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </label>
  );
}
