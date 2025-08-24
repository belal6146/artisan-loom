// Artisan - Core Types
// Single source of truth for all entities

export type ID = string;
export type ISO = string;

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
  followers: ID[];
  following: ID[];
  createdAt: ISO;
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
  type: "gallery" | "competition" | "meetup" | "class" | "seminar" | "volunteer";
  startsAt: ISO;
  endsAt: ISO;
  location: string;
  url?: string;
  description?: string;
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