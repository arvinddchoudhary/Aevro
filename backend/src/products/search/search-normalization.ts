const SEARCH_QUERY_MAX_LENGTH = 80;

const SYNONYMS: Record<string, string> = {
  pants: 'trouser',
  pant: 'trouser',
  trousers: 'trouser',
  'wide-leg': 'wide leg',
  'wide-leg-trousers': 'wide leg trouser',
  'formal pants': 'formal trouser',
};

export function normalizeSearchQuery(value?: string | null) {
  const normalized = value
    ?.normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, SEARCH_QUERY_MAX_LENGTH)
    .toLowerCase();

  if (!normalized) {
    return undefined;
  }

  return (
    SYNONYMS[normalized] ?? normalized
  )
    .replace(/\bwide-leg\b/g, 'wide leg')
    .replace(/\bpants?\b/g, 'trouser')
    .replace(/\btrousers\b/g, 'trouser');
}

export function searchTerms(value?: string | null) {
  const normalized = normalizeSearchQuery(value);

  return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
}

export const searchQueryLimit = SEARCH_QUERY_MAX_LENGTH;
