/**
 * Public card shape for promotions UI (home preview / /promotions page / modal).
 */
export type PromotionCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description?: string | null;
  imageUrl: string | null;
  href?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export const PROMOTION_ROUTES = {
  publicPage: "/promotions",
  publicApi: "/api/promotions",
  adminPage: "/admin/promotions",
  adminApi: "/api/admin/promotions",
  uploadApi: "/api/admin/upload",
} as const;
