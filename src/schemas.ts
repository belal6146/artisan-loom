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

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  birthday: z.string().optional(),
  followers: z.array(z.string()),
  following: z.array(z.string()),
  createdAt: z.string(),
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  username: z.string(),
  avatar: z.string().optional(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  birthday: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  birthday: z.string().optional(),
  followers: z.array(z.string()).optional(),
  following: z.array(z.string()).optional(),
});

// Auth schemas
export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const SignupCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  username: z.string().min(1),
});

// Post schemas
export const PostSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  type: z.enum(['image', 'video', 'text', 'gif']),
  content: z.string(),
  mediaUrl: z.string().optional(),
  createdAt: z.string(),
  likes: z.number(),
  commentIds: z.array(z.string()),
  likedBy: z.array(z.string()),
});

export const CreatePostSchema = z.object({
  type: z.enum(['image', 'video', 'text', 'gif']),
  content: z.string().min(1),
  mediaUrl: z.string().optional(),
  authorId: z.string().optional(),
});

// Artwork schemas
export const ArtworkSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string(),
  category: z.enum(['painting', 'sculpture', 'handicraft', 'digital', 'photography', 'other']),
  forSale: z.boolean(),
  price: MoneySchema.optional(),
  privacy: z.enum(['public', 'private']),
  location: z.string().optional(),
  meta: z.record(z.any()).optional(),
  createdAt: z.string(),
});

export const CreateArtworkSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string(),
  category: z.enum(['painting', 'sculpture', 'handicraft', 'digital', 'photography', 'other']),
  forSale: z.boolean(),
  price: MoneySchema.optional(),
  privacy: z.enum(['public', 'private']),
  location: z.string().optional(),
  meta: z.record(z.any()).optional(),
  userId: z.string().optional(),
});

export const UpdateArtworkSchema = CreateArtworkSchema.partial();

// Comment schemas
export const CommentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  authorId: z.string(),
  text: z.string(),
  createdAt: z.string(),
  likes: z.number(),
  likedBy: z.array(z.string()).optional(),
});

export const CreateCommentSchema = z.object({
  postId: z.string(),
  text: z.string().min(1),
});

// Collaboration schemas
export const CollaborationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  coverImage: z.string().optional(),
  deadline: z.string().optional(),
  skills: z.array(z.string()),
  compensationType: z.enum(['paid', 'revenue-share', 'voluntary']),
  compensation: z.string().optional(),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
  creatorId: z.string(),
  participants: z.number(),
  maxParticipants: z.number().optional(),
  createdAt: z.string(),
});

export const CreateCollaborationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  coverImage: z.string().optional(),
  deadline: z.string().optional(),
  skills: z.array(z.string()),
  compensationType: z.enum(['paid', 'revenue-share', 'voluntary']),
  compensation: z.string().optional(),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
  maxParticipants: z.number().optional(),
});

// Resource schemas
export const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['video', 'image', 'pdf']),
  url: z.string(),
  tags: z.array(z.string()),
  authorId: z.string(),
  createdAt: z.string(),
  likes: z.number(),
  commentIds: z.array(z.string()),
  likedBy: z.array(z.string()),
});

export const CreateResourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['video', 'image', 'pdf']),
  url: z.string(),
  tags: z.array(z.string()),
});

// Purchase schemas
export const PurchaseSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  artworkId: z.string(),
  price: MoneySchema,
  purchasedAt: z.string(),
});

export const CreatePurchaseSchema = z.object({
  artworkId: z.string(),
  price: MoneySchema,
});

// API Error schema
export const APIErrorSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

// Create Event schema
export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  type: EventTypeSchema,
  startsAt: z.string(),
  endsAt: z.string(),
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
export type User = z.infer<typeof UserSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type SignupCredentials = z.infer<typeof SignupCredentialsSchema>;
export type Post = z.infer<typeof PostSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type Artwork = z.infer<typeof ArtworkSchema>;
export type CreateArtwork = z.infer<typeof CreateArtworkSchema>;
export type UpdateArtwork = z.infer<typeof UpdateArtworkSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type Collaboration = z.infer<typeof CollaborationSchema>;
export type CreateCollaboration = z.infer<typeof CreateCollaborationSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type CreateResource = z.infer<typeof CreateResourceSchema>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export type CreatePurchase = z.infer<typeof CreatePurchaseSchema>;
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export type Event = z.infer<typeof EventSchema>;
export type ToolVendor = z.infer<typeof ToolVendorSchema>;
export type ToolProduct = z.infer<typeof ToolProductSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;
export type MarketplaceFilters = z.infer<typeof MarketplaceFiltersSchema>;
export type EventFilters = z.infer<typeof EventFiltersSchema>;