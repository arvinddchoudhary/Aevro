'use client';

import { useState } from 'react';

type AuthFieldProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export function AuthField({
  label,
  name,
  type = 'text',
  value,
  autoComplete,
  onChange,
}: AuthFieldProps) {
  const isPassword = type === 'password';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = isPassword && isPasswordVisible ? 'text' : type;

  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
        {label}
      </span>
      <span className="relative block">
        <input
          name={name}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={`h-11 w-full border border-[#ddd4c8] bg-transparent px-4 text-sm outline-none focus:border-[#111111] ${
            isPassword ? 'pr-12' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((current) => !current)}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center text-[#5f5a53] transition hover:text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111]"
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
      <path d="M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 9.5 7 9.5 7a14.6 14.6 0 0 1-2.2 3.2" />
      <path d="M6.1 6.7C3.8 8.3 2.5 12 2.5 12s3.5 7 9.5 7a9.2 9.2 0 0 0 4-.9" />
    </svg>
  );
}
