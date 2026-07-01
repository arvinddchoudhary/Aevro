import type { UserAddress } from '../../types/user';
import { AccountIcon } from './AccountIcons';

type AddressCardProps = {
  address: UserAddress;
  onDelete: (address: UserAddress) => void;
  onEdit: (address: UserAddress) => void;
  onSetDefault: (address: UserAddress) => void;
};

function addressIcon(address: UserAddress) {
  const label = address.label.toLowerCase();

  if (label.includes('home')) {
    return 'home';
  }

  if (label.includes('work') || label.includes('office')) {
    return 'bag';
  }

  return 'address';
}

export function AddressCard({
  address,
  onDelete,
  onEdit,
  onSetDefault,
}: AddressCardProps) {
  return (
    <article className="border border-[#e1d8cc] bg-[#fffaf3]/80 p-5 transition hover:border-[#cfc1b1] sm:p-6">
      <div className="grid gap-5 md:grid-cols-[72px_minmax(0,1fr)_auto] md:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e8de] text-[#211d18] sm:h-[74px] sm:w-[74px]">
          <AccountIcon name={addressIcon(address)} className="h-8 w-8" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-xl font-light text-[#111111] sm:text-2xl">
              {address.label}
            </h3>
            {address.isDefault && (
              <span className="bg-[#eee5da] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#5f574f]">
                Default
              </span>
            )}
          </div>
          <div className="mt-3 text-sm leading-6 text-[#2f2a25]">
            <p className="font-medium">{address.fullName}</p>
            <p>{address.phone}</p>
            <p className="mt-2">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ''}
            </p>
            <p>
              {address.city}, {address.state} {address.postalCode}
            </p>
            <p>{address.country}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:w-32 md:flex-col">
          {!address.isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(address)}
              className="inline-flex h-10 items-center justify-center border border-[#ddd4c8] px-4 text-xs font-medium uppercase tracking-[0.08em] transition hover:border-[#111111] md:w-full"
            >
              Set Default
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="inline-flex h-10 items-center justify-center gap-2 border border-[#ddd4c8] px-4 text-xs font-medium uppercase tracking-[0.08em] transition hover:border-[#111111] md:w-full"
          >
            <AccountIcon name="edit" className="h-4 w-4" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(address)}
            className="inline-flex h-10 items-center justify-center gap-2 border border-[#ddd4c8] px-4 text-xs font-medium uppercase tracking-[0.08em] transition hover:border-[#111111] md:w-full"
          >
            <AccountIcon name="delete" className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
