'use client';

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
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#777777]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full border border-[#ddd4c8] bg-transparent px-4 text-sm outline-none focus:border-[#111111]"
      />
    </label>
  );
}
