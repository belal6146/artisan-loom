// Artisan - Zod Schemas
// Validation schemas for all entities

import { z } from "zod";

// Base types
export const IDSchema = z.string().min(1);
export const ISOSchema = z.string().datetime();

export const MoneySchema = z.object({
  amount: z.number().min(0),
  currency: z.enum(["USD", "EUR", "GBP"]),
});

// User schemas
export const UserSchema = z.object({
  id: IDSchema,
  name: z.string().min(1).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  birthday: ISOSchema.optional(),
  followers: z.array(IDSchema),
  following: z.array(IDSchema),
  createdAt: ISOSchema,
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  followers: true,
  following: true,
  createdAt: true,
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  birthday: ISOSchema.optional(),
  avatar: z.string().url().optional(),
  followers: z.array(IDSchema).optional(),
  following: z.array(IDSchema).optional(),
});

// Artwork schemas
export const ArtworkSchema = z.object({
  id: IDSchema,
  userId: IDSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url(),
  category: z.enum(["painting", "sculpture", "handicraft", "digital", "photography", "other"]),
  forSale: z.boolean(),
  price: MoneySchema.optional(),
  privacy: z.enum(["public", "private"]),
  location: z.string().max(100).optional(),
  meta: z.object({
    tags: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    caption: z.string().optional(),
    aiGenerated: z.boolean().optional(),
    originalArtworkId: z.string().optional(),
  }).passthrough().optional(),
  createdAt: ISOSchema,
});

export const CreateArtworkSchema = ArtworkSchema.omit({
  id: true,
  createdAt: true,
});

export const UpdateArtworkSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(["painting", "sculpture", "handicraft", "digital", "photography", "other"]).optional(),
  forSale: z.boolean().optional(),
  price: MoneySchema.optional(),
  privacy: z.enum(["public", "private"]).optional(),
  location: z.string().max(100).optional(),
  meta: z.object({
    tags: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    caption: z.string().optional(),
    aiGenerated: z.boolean().optional(),
    originalArtworkId: z.string().optional(),
  }).passthrough().optional(),
});

// Post schemas
export const PostSchema = z.object({
  id: IDSchema,
  authorId: IDSchema,
  type: z.enum(["image", "video", "text", "gif"]),
  content: z.string().min(1).max(2000),
  mediaUrl: z.string().url().optional(),
  createdAt: ISOSchema,
  likes: z.number().min(0),
  commentIds: z.array(IDSchema),
  likedBy: z.array(IDSchema),
});

export const CreatePostSchema = PostSchema.omit({
  id: true,
  createdAt: true,
  likes: true,
  commentIds: true,
  likedBy: true,
});

// Comment schemas
export const CommentSchema = z.object({
  id: IDSchema,
  postId: IDSchema.optional(),
  artworkId: IDSchema.optional(),
  collaborationId: IDSchema.optional(),
  resourceId: IDSchema.optional(),
  authorId: IDSchema,
  text: z.string().min(1).max(500),
  createdAt: ISOSchema,
  likes: z.number().min(0),
  likedBy: z.array(IDSchema),
});

export const CreateCommentSchema = CommentSchema.omit({
  id: true,
  createdAt: true,
  likes: true,
  likedBy: true,
});

// Collaboration schemas
export const CollaborationSchema = z.object({
  id: IDSchema,
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  coverImage: z.string().url().optional(),
  deadline: ISOSchema.optional(),
  skills: z.array(z.string().min(1).max(50)),
  compensationType: z.enum(["paid", "revenue-share", "voluntary"]),
  compensation: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  contactInfo: z.string().max(200).optional(),
  creatorId: IDSchema,
  participants: z.number().min(0),
  maxParticipants: z.number().min(1).optional(),
  createdAt: ISOSchema,
});

export const CreateCollaborationSchema = CollaborationSchema.omit({
  id: true,
  participants: true,
  createdAt: true,
});

// Learning Resource schemas
export const ResourceSchema = z.object({
  id: IDSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["video", "image", "pdf"]),
  url: z.string().url(),
  tags: z.array(z.string().min(1).max(30)),
  authorId: IDSchema,
  createdAt: ISOSchema,
  likes: z.number().min(0),
  commentIds: z.array(IDSchema),
  likedBy: z.array(IDSchema),
});

export const CreateResourceSchema = ResourceSchema.omit({
  id: true,
  createdAt: true,
  likes: true,
  commentIds: true,
  likedBy: true,
});

// Event schemas
export const EventSchema = z.object({
  id: IDSchema,
  title: z.string().min(1).max(200),
  type: z.enum(["gallery", "competition", "meetup", "class", "seminar", "volunteer"]),
  startsAt: ISOSchema,
  endsAt: ISOSchema,
  location: z.string().min(1).max(200),
  url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
  createdAt: ISOSchema,
  attendees: z.array(IDSchema),
  maxAttendees: z.number().optional(),
}).refine(data => new Date(data.endsAt) > new Date(data.startsAt), {
  message: "End time must be after start time",
  path: ["endsAt"],
});

export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["gallery", "competition", "meetup", "class", "seminar", "volunteer"]),
  startsAt: ISOSchema,
  endsAt: ISOSchema,
  location: z.string().min(1).max(200),
  url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
}).refine(data => new Date(data.endsAt) > new Date(data.startsAt), {
  message: "End time must be after start time",
  path: ["endsAt"],
});

// Purchase schemas
export const PurchaseSchema = z.object({
  id: IDSchema,
  buyerId: IDSchema,
  artworkId: IDSchema,
  price: MoneySchema,
  purchasedAt: ISOSchema,
});

export const CreatePurchaseSchema = PurchaseSchema.omit({
  id: true,
  purchasedAt: true,
});

// Auth schemas
export const AuthUserSchema = z.object({
  id: IDSchema,
  email: z.string().email(),
  name: z.string().min(1).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  avatar: z.string().url().optional(),
});

export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const SignupCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
});

// Contact schemas
export const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(1000),
  category: z.enum(["general", "support", "partnership", "feedback"]),
});

// API Response schemas
export const APIResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
  });

export const APIErrorSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

// Utility type extractors
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type Artwork = z.infer<typeof ArtworkSchema>;
export type CreateArtwork = z.infer<typeof CreateArtworkSchema>;
export type UpdateArtwork = z.infer<typeof UpdateArtworkSchema>;
export type Post = z.infer<typeof PostSchema>;
export type CreatePost = z.infer<typeof CreatePostSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type Collaboration = z.infer<typeof CollaborationSchema>;
export type CreateCollaboration = z.infer<typeof CreateCollaborationSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type CreateResource = z.infer<typeof CreateResourceSchema>;
export type Event = z.infer<typeof EventSchema>;
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export type Purchase = z.infer<typeof PurchaseSchema>;
export type CreatePurchase = z.infer<typeof CreatePurchaseSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;
export type SignupCredentials = z.infer<typeof SignupCredentialsSchema>;
export type ContactForm = z.infer<typeof ContactSchema>;