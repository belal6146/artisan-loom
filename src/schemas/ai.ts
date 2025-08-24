// AI Schemas - Zod validation for AI operations
import { z } from "zod";

export const GenerateImageInputSchema = z.object({
  prompt: z.string().min(1).max(1000),
  refImageUrl: z.string().url().optional(),
  style: z.string().max(100).optional(),
  negative: z.string().max(500).optional(),
  strength: z.number().min(0).max(1).optional(),
});

export const GenerateImageOutputSchema = z.object({
  url: z.string().url(),
  meta: z.record(z.unknown()).optional(),
});

export const TagImageInputSchema = z.object({
  imageUrl: z.string().url(),
});

export const TagImageOutputSchema = z.object({
  tags: z.array(z.string()),
  colors: z.array(z.string()),
  caption: z.string(),
});

export const EmbedInputSchema = z.object({
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
}).refine(data => data.text || data.imageUrl, {
  message: "Either text or imageUrl must be provided",
});

export const ModerateInputSchema = z.object({
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
}).refine(data => data.text || data.imageUrl, {
  message: "Either text or imageUrl must be provided",
});

export const ModerateOutputSchema = z.object({
  ok: z.boolean(),
  reasons: z.array(z.string()).optional(),
});

export const SimilarSearchInputSchema = z.object({
  artworkId: z.string().optional(),
  text: z.string().optional(),
  imageUrl: z.string().url().optional(),
  limit: z.number().min(1).max(50).default(10),
}).refine(data => data.artworkId || data.text || data.imageUrl, {
  message: "At least one search parameter must be provided",
});

export const AIJobSchema = z.object({
  id: z.string(),
  type: z.enum(["generate-image", "tag-image", "embed", "moderate"]),
  status: z.enum(["pending", "running", "completed", "failed"]),
  progress: z.number().min(0).max(100),
  result: z.unknown().optional(),
  error: z.string().optional(),
  createdAt: z.string(),
});

// Type exports
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;
export type TagImageInput = z.infer<typeof TagImageInputSchema>;
export type TagImageOutput = z.infer<typeof TagImageOutputSchema>;
export type EmbedInput = z.infer<typeof EmbedInputSchema>;
export type ModerateInput = z.infer<typeof ModerateInputSchema>;
export type ModerateOutput = z.infer<typeof ModerateOutputSchema>;
export type SimilarSearchInput = z.infer<typeof SimilarSearchInputSchema>;
export type AIJob = z.infer<typeof AIJobSchema>;