// AI Types - Core interfaces for AI functionality
import type { ID } from "@/types";

export type AIProvider = "openai" | "stability" | "local";

export interface GenerateImageInput {
  prompt: string;
  refImageUrl?: string;
  style?: string;
  negative?: string;
  strength?: number;
}

export interface GenerateImageOutput {
  url: string;
  meta?: Record<string, unknown>;
}

export interface TagImageInput {
  imageUrl: string;
}

export interface TagImageOutput {
  tags: string[];
  colors: string[];
  caption: string;
}

export interface EmbedInput {
  text?: string;
  imageUrl?: string;
}

export interface ModerateInput {
  text?: string;
  imageUrl?: string;
}

export interface ModerateOutput {
  ok: boolean;
  reasons?: string[];
}

export interface SimilarSearchInput {
  artworkId?: ID;
  text?: string;
  imageUrl?: string;
  limit?: number;
}

export interface SimilarSearchResult {
  id: ID;
  score: number;
  artwork?: {
    id: ID;
    title: string;
    imageUrl: string;
    userId: ID;
  };
}

export interface AIJob {
  id: ID;
  type: "generate-image" | "tag-image" | "embed" | "moderate";
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  result?: unknown;
  error?: string;
  createdAt: string;
}

export interface VectorSearchResult {
  id: ID;
  score: number;
  meta: Record<string, unknown>;
}

// Style presets for image generation
export const IMAGE_STYLES = [
  // Art movements
  "Impressionism",
  "Baroque", 
  "Cubism",
  "Surrealism",
  "Ukiyo-e",
  "Bauhaus",
  "Madhubani",
  "Persian miniatures",
  // Techniques
  "Watercolor wash",
  "Pointillism", 
  "Linocut",
  "Woodblock",
  "Pastel",
  "Acrylic impasto",
] as const;

export type ImageStyle = typeof IMAGE_STYLES[number];