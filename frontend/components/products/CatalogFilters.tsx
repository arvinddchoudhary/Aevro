'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { FacetOption, ProductFacets, ProductSort } from '../../types/catalog';

type CatalogFiltersProps = {
  facets: ProductFacets;
  current: {
    category: string[];
    color: string[];
    size: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock: boolean;
    sort: ProductSort;
    search?: string;
  };
  total: number;
};

type DraftFilters = CatalogFiltersProps['current'];

function toggleValue(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function buildQuery(current: DraftFilters, pathname: string) {
  const params = new URLSearchParams();
  const set = (key: string, value: string | undefined) => {
    if (value) params.set(key, value);
  };

  set('search', current.search?.trim() || undefined);
  set('category', current.category.join(','));
  set('color', current.color.join(','));
  set('size', current.size.join(','));
  set('minPrice', current.minPrice === undefined ? undefined : String(current.minPrice));
  set('maxPrice', current.maxPrice === undefined ? undefined : String(current.maxPrice));
  if (current.inStock) set('inStock', 'true');
  if (current.sort !== 'newest') set('sort', current.sort);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function OptionList({
  options,
  selected,
  onToggle,
  showSwatch = false,
}: {
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
  showSwatch?: boolean;
}) {
  if (options.length === 0) {
    return <p className="text-sm text-[#77716a]">No matching options.</p>;
  }

  return (
    <div className="grid gap-2">
      {options.map((option) => {
        const checked = selected.includes(option.value);

        return (
          <label
            key={option.value}
            className={`flex min-h-10 cursor-pointer items-center justify-between gap-3 border px-3 text-sm ${checked ? 'border-[#111111] bg-[#eee5da]' : 'border-[#ddd4c8] bg-[#fffaf3]'}`}
          >
            <span className="flex min-w-0 items-center gap-2">
              {showSwatch ? (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 rounded-full border border-[#111111]/25"
                  style={{ backgroundColor: option.hex ?? '#d8cfc2' }}
                />
              ) : null}
              <span className="truncate">{option.label}</span>
            </span>
            <span className="shrink-0 text-xs text-[#77716a]">{option.count}</span>
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => onToggle(option.value)}
              aria-label={`${option.label}, ${option.count} products`}
            />
          </label>
        );
      })}
    </div>
  );
}

function FilterFields({
  facets,
  draft,
  setDraft,
}: {
  facets: ProductFacets;
  draft: DraftFilters;
  setDraft: (next: DraftFilters) => void;
}) {
  const update = <K extends keyof DraftFilters>(key: K, value: DraftFilters[K]) => {
    setDraft({ ...draft, [key]: value });
  };

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]">Category</legend>
        <OptionList
          options={facets.categories}
          selected={draft.category}
          onToggle={(value) => update('category', toggleValue(draft.category, value))}
        />
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]">Color</legend>
        <OptionList
          options={facets.colors}
          selected={draft.color}
          showSwatch
          onToggle={(value) => update('color', toggleValue(draft.color, value))}
        />
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]">Size</legend>
        <OptionList
          options={facets.sizes}
          selected={draft.size}
          onToggle={(value) => update('size', toggleValue(draft.size, value))}
        />
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]">Price in INR</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={draft.minPrice ?? ''}
            onChange={(event) => update('minPrice', event.target.value ? Number(event.target.value) : undefined)}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={facets.priceRange.min ? `₹${facets.priceRange.min}` : 'Min'}
            className="h-11 min-w-0 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm outline-none focus:border-[#111111]"
            aria-label="Minimum price"
          />
          <input
            value={draft.maxPrice ?? ''}
            onChange={(event) => update('maxPrice', event.target.value ? Number(event.target.value) : undefined)}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder={facets.priceRange.max ? `₹${facets.priceRange.max}` : 'Max'}
            className="h-11 min-w-0 border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm outline-none focus:border-[#111111]"
            aria-label="Maximum price"
          />
        </div>
      </fieldset>
      <label className="flex min-h-11 cursor-pointer items-center justify-between border border-[#ddd4c8] bg-[#fffaf3] px-3 text-sm">
        <span>In stock only</span>
        <input
          type="checkbox"
          checked={draft.inStock}
          onChange={(event) => update('inStock', event.target.checked)}
          className="h-4 w-4 accent-[#111111]"
        />
      </label>
    </div>
  );
}

export function CatalogFilters({ facets, current, total }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [draft, setDraft] = useState<DraftFilters>(current);
  useEffect(() => {
    setDraft(current);
  }, [current]);
  const selectedLabels = useMemo(
    () => [
      ...current.color.map((value) => facets.colors.find((item) => item.value === value)?.label ?? value),
      ...current.size.map((value) => `Size ${value}`),
      ...current.category.map((value) => facets.categories.find((item) => item.value === value)?.label ?? value),
      ...(current.inStock ? ['In stock'] : []),
      ...(current.minPrice !== undefined || current.maxPrice !== undefined ? ['Price'] : []),
    ],
    [current, facets],
  );

  const apply = (next = draft) => {
    router.push(buildQuery({ ...next, minPrice: next.minPrice ?? undefined, maxPrice: next.maxPrice ?? undefined }, pathname));
    setFilterOpen(false);
    setSortOpen(false);
  };

  const remove = (key: 'category' | 'color' | 'size', value: string) => {
    apply({ ...current, [key]: current[key].filter((item) => item !== value) });
  };

  const clear = () => {
    setDraft({ category: [], color: [], size: [], inStock: false, sort: 'newest', search: undefined });
    router.push(pathname);
    setFilterOpen(false);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.08em] lg:hidden">
        {current.category.map((value) => (
          <button key={`category-${value}`} type="button" onClick={() => remove('category', value)} className="border border-[#d8cfc2] bg-[#fffaf3] px-3 py-2">{facets.categories.find((item) => item.value === value)?.label ?? value} ×</button>
        ))}
        {current.color.map((value) => (
          <button key={`color-${value}`} type="button" onClick={() => remove('color', value)} className="border border-[#d8cfc2] bg-[#fffaf3] px-3 py-2">{facets.colors.find((item) => item.value === value)?.label ?? value} ×</button>
        ))}
        {current.size.map((value) => (
          <button key={`size-${value}`} type="button" onClick={() => remove('size', value)} className="border border-[#d8cfc2] bg-[#fffaf3] px-3 py-2">Size {value} ×</button>
        ))}
        {current.minPrice !== undefined || current.maxPrice !== undefined ? (
          <button type="button" onClick={() => apply({ ...current, minPrice: undefined, maxPrice: undefined })} className="border border-[#d8cfc2] bg-[#fffaf3] px-3 py-2">
            ₹{current.minPrice ?? 0}–₹{current.maxPrice ?? '∞'}
            {' '}×
          </button>
        ) : null}
        {current.inStock ? <button type="button" onClick={() => apply({ ...current, inStock: false })} className="border border-[#d8cfc2] bg-[#fffaf3] px-3 py-2">In stock ×</button> : null}
      </div>

      <div className="sticky top-[72px] z-20 -mx-4 mb-6 grid grid-cols-3 divide-x divide-[#ddd4c8] border-y border-[#ddd4c8] bg-[#fbf7f0]/96 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setFilterOpen(true)} className="h-14 text-xs font-medium uppercase tracking-[0.08em]">
          Filter
        </button>
        <button type="button" onClick={() => setSortOpen(true)} className="h-14 text-xs font-medium uppercase tracking-[0.08em]">
          Sort
        </button>
        <button type="button" onClick={clear} className={`h-14 text-xs font-medium uppercase tracking-[0.08em] ${selectedLabels.length ? 'text-[#111111]' : 'text-[#aaa39a]'}`}>
          Clear
        </button>
      </div>

      <aside className="hidden lg:block lg:border-r lg:border-[#ddd4c8] lg:pr-8 xl:pr-10">
        <div className="mb-6 flex items-center justify-between border-b border-[#ddd4c8] pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.1em]">Filter</p>
          <button type="button" onClick={clear} className="text-xs uppercase tracking-[0.08em] underline-offset-4 hover:underline">Clear all</button>
        </div>
        <FilterFields facets={facets} draft={draft} setDraft={setDraft} />
        <button type="button" onClick={() => apply()} className="mt-7 h-12 w-full bg-[#111111] text-xs font-medium uppercase tracking-[0.1em] text-[#fffaf3]">Apply filters</button>
      </aside>

      {filterOpen ? (
        <div className="fixed inset-0 z-50 bg-[#1b1510]/35 lg:hidden" role="presentation" onMouseDown={() => setFilterOpen(false)}>
          <section className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[16px] border-t border-[#ddd4c8] bg-[#fbf7f0] p-5 pb-28 shadow-[0_-18px_60px_rgba(49,37,26,0.18)]" role="dialog" aria-modal="true" aria-label="Product filters" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">Filters</h2>
              <button type="button" onClick={() => setFilterOpen(false)} aria-label="Close filters" className="h-10 w-10 border border-[#ddd4c8] text-xl">×</button>
            </div>
            <FilterFields facets={facets} draft={draft} setDraft={setDraft} />
            <div className="fixed inset-x-0 bottom-[72px] z-10 flex gap-3 border-t border-[#ddd4c8] bg-[#fbf7f0] p-4">
              <button type="button" onClick={() => setDraft({ category: [], color: [], size: [], inStock: false, sort: 'newest', search: current.search })} className="h-12 flex-1 border border-[#111111] text-xs font-medium uppercase tracking-[0.08em]">Clear</button>
              <button type="button" onClick={() => apply()} className="h-12 flex-[2] bg-[#111111] text-xs font-medium uppercase tracking-[0.08em] text-[#fffaf3]">Show {total} products</button>
            </div>
          </section>
        </div>
      ) : null}

      {sortOpen ? (
        <div className="fixed inset-0 z-50 bg-[#1b1510]/35 lg:hidden" role="presentation" onMouseDown={() => setSortOpen(false)}>
          <section className="absolute inset-x-0 bottom-[72px] rounded-t-[16px] border-t border-[#ddd4c8] bg-[#fbf7f0] p-5 pb-8" role="dialog" aria-modal="true" aria-label="Sort products" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold uppercase tracking-[0.16em]">Sort by</h2><button type="button" onClick={() => setSortOpen(false)} aria-label="Close sort menu" className="h-10 w-10 border border-[#ddd4c8] text-xl">×</button></div>
            {([
              ['relevance', 'Relevance'],
              ['featured', 'Featured'],
              ['newest', 'Newest'],
              ['price_asc', 'Price low to high'],
              ['price_desc', 'Price high to low'],
            ] as [ProductSort, string][]).map(([value, label]) => (
              <button key={value} type="button" onClick={() => apply({ ...draft, sort: value })} className={`flex h-12 w-full items-center justify-between border-b border-[#ddd4c8] text-left text-sm ${current.sort === value ? 'font-medium' : ''}`}>
                {label}<span>{current.sort === value ? '✓' : ''}</span>
              </button>
            ))}
          </section>
        </div>
      ) : null}
    </>
  );
}
