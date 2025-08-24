import { z } from 'zod';

// Core type schemas
export const EventTypeSchema = z.enum(['gallery', 'competition', 'meetup', 'class', 'seminar', 'volunteer']);

export const MediaCategorySchema = z.enum([
  'painting', 'drawing', 'printmaking', 'sculpture', 'ceramics',
  'textiles', 'photography', 'electronic', 'installation', 'glass', 'literature', 'sound', 'other'
]);

export const RatingSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)
]);

export const MoneySchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
});

// Event schemas
export const EventSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  type: EventTypeSchema,
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  location: z.string().min(1).max(200),
  url: z.string().url().optional(),
  venue: z.string().max(200).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  source: z.string().optional(),
  verified: z.boolean().optional(),
  verdict: z.enum(['ok', 'suspicious', 'blocked']).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  attendees: z.number().nonnegative().optional(),
  maxAttendees: z.number().nonnegative().optional(),
});

// Marketplace schemas  
export const ToolVendorSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  domain: z.string().min(1),
  country: z.string().max(50).optional(),
  logo: z.string().url().optional(),
  categories: z.array(MediaCategorySchema),
  verified: z.literal(true),
  ratingAvg: z.number().min(0).max(5),
  ratingCount: z.number().nonnegative(),
});

export const ToolProductSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  name: z.string().min(1).max(200),
  imageUrl: z.string().url().optional(),
  url: z.string().url(),
  category: MediaCategorySchema,
  subcategory: z.string().max(100).optional(),
  price: MoneySchema,
  availability: z.enum(['in-stock', 'out-of-stock', 'preorder']),
  ratingAvg: z.number().min(0).max(5),
  ratingCount: z.number().nonnegative(),
  specs: z.record(z.string()).optional(),
});

export const ReviewSchema = z.object({
  id: z.string(),
  targetType: z.enum(['product', 'vendor']),
  targetId: z.string(),
  authorId: z.string(),
  rating: RatingSchema,
  text: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
});

// API request/response schemas
export const ReviewCreateSchema = z.object({
  targetType: z.enum(['product', 'vendor']),
  targetId: z.string(),
  rating: RatingSchema,
  text: z.string().max(1000).optional(),
});

export const MarketplaceFiltersSchema = z.object({
  category: MediaCategorySchema.optional(),
  vendorId: z.string().optional(),
  q: z.string().max(100).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
});

export const EventFiltersSchema = z.object({
  type: EventTypeSchema.optional(),
  city: z.string().max(100).optional(),
  radiusKm: z.number().positive().max(1000).optional(),
  verifiedOnly: z.boolean().default(true),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Type inference
export type EventType = z.infer<typeof EventTypeSchema>;
export type MediaCategory = z.infer<typeof MediaCategorySchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type Money = z.infer<typeof MoneySchema>;
export type Event = z.infer<typeof EventSchema>;
export type ToolVendor = z.infer<typeof ToolVendorSchema>;
export type ToolProduct = z.infer<typeof ToolProductSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;
export type MarketplaceFilters = z.infer<typeof MarketplaceFiltersSchema>;
export type EventFilters = z.infer<typeof EventFiltersSchema>;