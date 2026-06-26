export type HomepageSectionType =
  | 'HERO'
  | 'FEATURED_COLLECTION'
  | 'FEATURED_PRODUCTS'
  | 'LOOKBOOK'
  | 'CAMPAIGN_BANNER';

export type HomepageSection = {
  id: string;
  type: HomepageSectionType;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};
