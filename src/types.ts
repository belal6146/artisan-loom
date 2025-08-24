// Artisan - Core Types
// Single source of truth for all entities

export type ID = string;
export type ISO = string;
export type Period = "7d" | "30d" | "90d" | "365d" | "all";
export type EventType = "gallery" | "competition" | "meetup" | "class" | "seminar" | "volunteer";
export type MediaCategory = 
  | "painting" | "drawing" | "printmaking" | "sculpture" | "ceramics"
  | "textiles" | "photography" | "electronic" | "installation" | "glass" | "literature" | "sound" | "other";
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Money {
  amount: number;
  currency: "USD" | "EUR" | "GBP";
}

export interface User {
  id: ID;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  birthday?: ISO;
  location?: string;
  website?: string;
  followers: ID[];
  following: ID[];
  createdAt: ISO;
}

export interface ProfileSummary {
  id: ID;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  posts: number;
  artworks: number;
  sales?: number; // sales only if owner
}

export interface ProfileInsights {
  userId: ID;
  period: Period;
  creator: {
    posts: number;
    likes: number;
    comments: number;
    followersDelta: number;
    topPosts: ID[];
  };
  buyer?: { // owner-only
    purchases: number;
    totalSpent: Money;
    avgPrice?: Money;
    topCategories: { category: Artwork["category"]; count: number }[];
    topArtists: { userId: ID; name: string; count: number }[];
    timeline: { purchasedAt: ISO; artworkId: ID; price: Money }[];
  };
}

export interface Artwork {
  id: ID;
  userId: ID;
  title: string;
  description?: string;
  imageUrl: string;
  category: "painting" | "sculpture" | "handicraft" | "digital" | "photography" | "other";
  forSale: boolean;
  price?: Money;
  privacy: "public" | "private";
  location?: string;
  meta?: {
    tags?: string[];
    colors?: string[];
    caption?: string;
    aiGenerated?: boolean;
    originalArtworkId?: string;
    [key: string]: unknown;
  };
  createdAt: ISO;
}

export interface Post {
  id: ID;
  authorId: ID;
  type: "image" | "video" | "text" | "gif";
  content: string;
  mediaUrl?: string;
  createdAt: ISO;
  likes: number;
  commentIds: ID[];
  likedBy: ID[];
}

export interface Comment {
  id: ID;
  postId: ID;
  authorId: ID;
  text: string;
  createdAt: ISO;
  likes: number;
  likedBy?: ID[];
}

export interface Resource {
  id: ID;
  title: string;
  description?: string;
  type: "video" | "image" | "pdf";
  url: string;
  tags: string[];
  authorId: ID;
  createdAt: ISO;
  likes: number;
  commentIds: ID[];
  likedBy: ID[];
}

export interface Collaboration {
  id: ID;
  name: string;
  description: string;
  coverImage?: string;
  deadline?: ISO;
  skills: string[];
  compensationType: "paid" | "revenue-share" | "voluntary";
  compensation?: string;
  location?: string;
  contactInfo?: string;
  creatorId: ID;
  participants: number;
  maxParticipants?: number;
  createdAt: ISO;
}

export interface Event {
  id: ID;
  title: string;
  type: EventType;
  startsAt: ISO;
  endsAt: ISO;
  location: string;
  url?: string;
  venue?: string;
  lat?: number;
  lng?: number;
  source?: string;
  verified?: boolean;
  verdict?: "ok" | "suspicious" | "blocked";
  description?: string;
  imageUrl?: string;
  attendees?: number;
  maxAttendees?: number;
}

// Marketplace types
export interface ToolVendor {
  id: ID;
  name: string;
  domain: string;
  country?: string;
  logo?: string;
  categories: MediaCategory[];
  verified: true;
  ratingAvg: number;
  ratingCount: number;
}

export interface ToolProduct {
  id: ID;
  vendorId: ID;
  name: string;
  imageUrl?: string;
  url: string;
  category: MediaCategory;
  subcategory?: string;
  price: Money;
  availability: "in-stock" | "out-of-stock" | "preorder";
  ratingAvg: number;
  ratingCount: number;
  specs?: Record<string, string>;
}

export interface Review {
  id: ID;
  targetType: "product" | "vendor";
  targetId: ID;
  authorId: ID;
  rating: Rating;
  text?: string;
  createdAt: ISO;
}

export interface Purchase {
  id: ID;
  buyerId: ID;
  artworkId: ID;
  price: Money;
  purchasedAt: ISO;
}

// Auth types
export interface AuthUser {
  id: ID;
  email: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  username: string;
}

// API Response types
export interface APIResponse<T> {
  data: T;
  message?: string;
}

export interface APIError {
  error: string;
  details?: string;
}

// Route types
export type RouteParams = {
  id?: string;
  username?: string;
};