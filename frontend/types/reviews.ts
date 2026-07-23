export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
export type ReviewFitFeedback = 'RUNS_SMALL' | 'TRUE_TO_SIZE' | 'RUNS_LARGE';

export type PublicProductReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  fitFeedback: ReviewFitFeedback | null;
  purchasedSize: string | null;
  purchasedColor: string | null;
  verifiedPurchase: true;
  reviewerName: string;
  createdAt: string;
  images: Array<{ id: string; url: string; sortOrder: number }>;
};

export type ReviewSummary = {
  averageRating: number | null;
  reviewCount: number;
  ratingBreakdown: Record<number, number>;
  fitBreakdown: Record<ReviewFitFeedback, number>;
};

export type ProductReviewsResponse = {
  success: true;
  summary: ReviewSummary;
  data: PublicProductReview[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
};

export type CustomerReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  fitFeedback: ReviewFitFeedback | null;
  purchasedSize: string | null;
  purchasedColor: string | null;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  moderationReason: string | null;
  deletedAt: string | null;
  images: Array<{ id: string; url: string; sortOrder: number }>;
  updatedAt: string;
};

export type OrderReviewEligibility = {
  orderStatus: string;
  items: Array<{
    orderItemId: string;
    productId: string | null;
    productName: string;
    productSlug: string | null;
    eligible: boolean;
    ineligibilityReason: string | null;
    review: CustomerReview | null;
  }>;
};
