'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getProductSuggestions, getProducts } from '../../lib/api/catalog';
import { formatPrice } from '../../lib/format';
import type { Product } from '../../types/catalog';

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

const popularSuggestions = [
  'Black trousers',
  'Pleated trousers',
  'Wide leg trousers',
  'Formal trousers',
  'Beige trousers',
  'Straight fit trousers',
  'Workwear trousers',
  'Trousers for men',
  'Linen trousers',
  'Casual trousers for men',
];

const suggestionMap: Record<string, string> = {
  beige: 'Beige trousers',
  black: 'Black trousers',
  formal: 'Formal trousers',
  office: 'Workwear trousers',
  pant: 'Trousers',
  pants: 'Trousers',
  tee: 'T-shirts for men',
  tshirt: 'T-shirts for men',
  't-shirt': 'T-shirts for men',
  wide: 'Wide leg trousers',
};

function normalizeQuery(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function productImage(product: Product) {
  return product.primaryImage ?? product.images[0] ?? null;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [backendSuggestions, setBackendSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizedQuery = normalizeQuery(query);

  const smartSuggestions = useMemo(() => {
    const lowered = normalizedQuery.toLowerCase();

    if (!lowered) {
      return popularSuggestions;
    }

    const mappedSuggestions = Object.entries(suggestionMap)
      .filter(([term]) => lowered.includes(term))
      .map(([, suggestion]) => suggestion);
    const matchingSuggestions = popularSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(lowered),
    );

    return Array.from(new Set([...backendSuggestions, ...mappedSuggestions, ...matchingSuggestions])).slice(0, 8);
  }, [backendSuggestions, normalizedQuery]);

  const goToSearch = (term = normalizedQuery) => {
    const nextQuery = normalizeQuery(term);

    if (!nextQuery) {
      return;
    }

    onClose();
    setQuery('');
    router.push(`/products?search=${encodeURIComponent(nextQuery)}`);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => inputRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || normalizedQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError('');
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await getProducts({
          search: normalizedQuery,
          limit: 6,
        }, { signal: controller.signal });

        if (!controller.signal.aborted) {
          setResults(response.data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError('Search is unavailable right now.');
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, normalizedQuery]);

  useEffect(() => {
    if (!isOpen || normalizedQuery.length < 2) {
      setBackendSuggestions([]);
      setIsSuggestionLoading(false);
      setActiveSuggestion(-1);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSuggestionLoading(true);
        const response = await getProductSuggestions(normalizedQuery, {
          limit: 8,
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setBackendSuggestions(response.data.map((suggestion) => suggestion.label));
        }
      } catch {
        if (!controller.signal.aborted) setBackendSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsSuggestionLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, normalizedQuery]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#1b1510]/36 px-0 py-0 backdrop-blur-[7px] sm:px-5 sm:py-8 lg:py-[7vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search AEVRO products"
      onMouseDown={(event) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        className="flex h-full max-h-screen w-full max-w-[1080px] flex-col overflow-hidden border border-[#d8cfc2] bg-[#fbf7f0]/96 shadow-[0_34px_100px_rgba(20,15,10,0.24)] sm:h-auto sm:max-h-[calc(100vh-64px)] sm:rounded-[6px] lg:max-h-[calc(100vh-96px)]"
      >
        <div className="flex items-start justify-between gap-4 px-4 pb-4 pt-5 sm:px-9 sm:pt-8">
          <div className="min-w-0">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-[#8a5f36]">
              Search AEVRO
            </p>
            <p className="mt-2 font-serif text-sm leading-5 text-[#6f665d] sm:text-base">
              Discover refined trousers for every occasion.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#d8cfc2] bg-[#fbf7f0] text-[#625a51] transition hover:border-[#111111] hover:text-[#111111]"
            aria-label="Close search"
          >
            <span aria-hidden="true" className="text-3xl font-light leading-none">
              ×
            </span>
          </button>
        </div>

        <form
          className="border-b border-[#ddd4c8] px-4 pb-5 pt-2 sm:px-9 sm:pb-7 sm:pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            goToSearch();
          }}
        >
          <label className="sr-only" htmlFor="aevro-search-input">
            Search products
          </label>
          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#70675f]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-6 w-6"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16.2 16.2 4.3 4.3" />
                </svg>
              </span>
              <input
                ref={inputRef}
                id="aevro-search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setActiveSuggestion((current) => Math.min(current + 1, smartSuggestions.length - 1));
                  }
                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setActiveSuggestion((current) => Math.max(current - 1, -1));
                  }
                  if (event.key === 'Enter' && activeSuggestion >= 0) {
                    event.preventDefault();
                    goToSearch(smartSuggestions[activeSuggestion]);
                  }
                  if (event.key === 'Escape') onClose();
                }}
                placeholder="Search trousers, black trousers, pleated trousers..."
                className="h-14 w-full border border-[#a89078] bg-[#fffdf8]/72 pl-14 pr-4 font-serif text-lg font-light text-[#111111] outline-none transition placeholder:text-[#82786f] focus:border-[#111111] sm:h-[72px] sm:pl-16 sm:text-[1.8rem]"
                aria-label="Search products"
              />
            </div>
            <button
              type="submit"
              disabled={!normalizedQuery}
              className="h-12 cursor-pointer bg-[#a39079] px-7 text-xs font-semibold uppercase tracking-[0.28em] text-[#fffaf3] transition hover:bg-[#8d7b66] disabled:cursor-not-allowed disabled:bg-[#c3b8ab] sm:h-[72px] sm:tracking-[0.34em]"
            >
              Search
            </button>
          </div>
        </form>

        <div className="grid min-h-0 gap-0 overflow-y-auto lg:grid-cols-[350px_1fr]">
          <section className="border-b border-[#ddd4c8] p-4 sm:px-9 sm:py-7 lg:border-b-0 lg:border-r">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-[#111111]">
              Suggestions
            </p>
            <div className="mt-4 grid gap-1.5">
              {isSuggestionLoading && normalizedQuery.length >= 2 ? (
                <p className="px-2 text-xs uppercase tracking-[0.12em] text-[#77716a]">Finding matches...</p>
              ) : null}
              {smartSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => goToSearch(suggestion)}
                  className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 border border-[#d8cfc2] bg-[#fbf7f0]/70 px-4 text-left text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[#3d3732] transition hover:border-[#111111] hover:bg-[#fffdf8] sm:h-[46px] sm:text-[0.7rem] sm:tracking-[0.24em] ${activeSuggestion === index ? 'border-[#111111] bg-[#fffdf8]' : ''}`}
                >
                  <span>{suggestion}</span>
                  <span aria-hidden="true" className="text-lg font-light text-[#8a8177]">
                    ›
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="p-4 sm:px-9 sm:py-7">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-[#111111]">
                Top Matches
              </p>
              {normalizedQuery.length >= 2 ? (
                <button
                  type="button"
                  onClick={() => goToSearch()}
                  className="cursor-pointer text-xs uppercase tracking-[0.12em] underline underline-offset-4"
                >
                  View all
                </button>
              ) : null}
            </div>

            {normalizedQuery.length < 2 ? (
              <div className="border border-[#e1d8cc] bg-[#fffaf3]/72 p-6 font-serif text-base leading-6 text-[#625a51]">
                Start typing to preview real AEVRO products.
              </div>
            ) : isLoading ? (
              <div className="grid gap-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-3 border border-[#e1d8cc] bg-[#fffaf3]/72 p-3">
                    <span className="block h-20 w-16 animate-pulse bg-[#eee5da]" />
                    <span className="mt-2 block h-4 flex-1 animate-pulse bg-[#eee5da]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="border border-[#d8cfc2] bg-[#fffaf3]/72 p-6 text-sm text-[#625a51]">
                {error}
              </div>
            ) : results.length > 0 ? (
              <div className="grid gap-3">
                {results.map((product) => {
                  const image = productImage(product);

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="group grid min-h-[86px] cursor-pointer grid-cols-[70px_minmax(0,1fr)_auto] items-center gap-3 border border-[#e1d8cc] bg-[#fffaf3]/82 p-2.5 transition hover:border-[#111111] sm:grid-cols-[84px_1fr_auto] sm:gap-4"
                    >
                      <div className="h-[64px] w-[64px] overflow-hidden rounded-[4px] bg-[#eee5da] sm:h-[76px] sm:w-[76px]">
                        {image ? (
                          <img
                            src={image.url}
                            alt={image.altText ?? product.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-serif text-sm uppercase tracking-[0.04em] text-[#111111] sm:text-[1.05rem]">
                          {product.name}
                        </p>
                        <p className="mt-1 font-serif text-sm text-[#777067]">
                          {product.category?.name ?? product.color ?? 'AEVRO'}
                        </p>
                        <p className="mt-2 font-serif text-sm text-[#111111]">
                          {formatPrice(product.priceInPaise)}
                        </p>
                      </div>
                      <span aria-hidden="true" className="pr-1 text-2xl font-light text-[#8a8177] sm:pr-4 sm:text-3xl">
                        ›
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="border border-[#e1d8cc] bg-[#fffaf3]/72 p-6">
                <h2 className="font-serif text-2xl font-light text-[#111111]">
                  No products match this search.
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#625a51]">
                  Try trousers, wide leg trousers, black trousers, or formal trousers.
                </p>
              </div>
            )}
          </section>
        </div>
        <div className="border-t border-[#ddd4c8] px-6 py-4 text-center font-serif text-sm text-[#6f665d] sm:px-9">
          Can't find what you're looking for?{' '}
          <button
            type="button"
            onClick={() => goToSearch('trousers')}
            className="cursor-pointer underline underline-offset-4"
          >
            View all trousers
          </button>
        </div>
      </div>
    </div>
  );
}
