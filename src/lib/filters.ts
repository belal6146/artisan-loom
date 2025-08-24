import { z } from "zod";

// Tab and filter schemas
export const ExploreTabSchema = z.enum(["for-you", "following", "nearby", "trending", "collaborations", "learn"]);

export const NearbyFiltersSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  radiusKm: z.number().int().min(1).max(100).default(25),
});

export const SortSchema = z.enum(["rank", "latest"]).default("rank");

export const PagerSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(10).max(50).default(20),
});

export const ExploreFiltersSchema = z.object({
  tab: ExploreTabSchema.default("for-you"),
  sort: SortSchema,
  pager: PagerSchema,
  nearby: NearbyFiltersSchema.optional(),
});

// Type inference
export type ExploreTab = z.infer<typeof ExploreTabSchema>;
export type NearbyFilters = z.infer<typeof NearbyFiltersSchema>;
export type Sort = z.infer<typeof SortSchema>;
export type Pager = z.infer<typeof PagerSchema>;
export type ExploreFilters = z.infer<typeof ExploreFiltersSchema>;

// Normalizer functions
export const normalizeTab = (tab: string | null): ExploreTab => {
  const result = ExploreTabSchema.safeParse(tab);
  return result.success ? result.data : "for-you";
};

export const normalizeSort = (sort: string | null): Sort => {
  const result = SortSchema.safeParse(sort);
  return result.success ? result.data : "rank";
};

export const normalizeLimit = (limit: string | number | null): number => {
  const num = typeof limit === 'string' ? parseInt(limit, 10) : limit;
  const result = z.number().int().min(10).max(50).safeParse(num);
  return result.success ? result.data : 20;
};