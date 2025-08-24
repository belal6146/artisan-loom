// AI Client - Frontend interface for AI services
import { env } from "@/lib/env";
import { log } from "@/lib/log";
import { track } from "@/lib/track";

type Provider = 'openai' | 'gemini' | 'deepseek' | 'local';
const has = (k:string) => Boolean(import.meta.env[k as keyof ImportMetaEnv]);
const hash = (s:string) =>
  Array.from(new TextEncoder().encode(s))
    .reduce((a,b)=>((a<<5)-a+b)>>>0,0)
    .toString(16);

export interface GenerateImageInput {
  prompt: string;
  refImageUrl?: string;
  style?: string;
  negative?: string;
  strength?: number;
}

export interface GenerateImageOutput {
  url: string;
  meta: {
    provider: string;
    aiGenerated: boolean;
  };
}

export interface TagImageInput {
  imageUrl: string;
  metadata?: Record<string, unknown>;
}

export interface TagImageOutput {
  tags: string[];
  confidence: number;
}

export interface EmbedInput {
  text: string;
  imageUrl?: string;
}

export interface ModerateInput {
  content: string;
  imageUrl?: string;
}

export interface ModerateOutput {
  isAppropriate: boolean;
  confidence: number;
}

export interface SimilarSearchInput {
  query: string;
  limit?: number;
}

export interface SimilarSearchOutput {
  id: string;
  title: string;
  score: number;
}

export async function generateImage(opts: { prompt: string; style?: string; provider?: Provider }): Promise<{ url: string; provider: Provider; note?: string }> {
  const provider: Provider = opts.provider ?? (import.meta.env.VITE_AI_PROVIDER as Provider) ?? 'local';
  const wantLocal = provider === 'local' || !has('VITE_AI_ENABLE_IMAGE');
  const seed = hash(`${opts.prompt}::${opts.style ?? ''}`);
  const local = () => ({ url: `https://picsum.photos/seed/${seed}/1024/768`, provider: 'local' as Provider, note: 'local-fallback' });
  
  try {
    if (wantLocal) return local();
    // keep your existing provider branches here; on any error, fall through
    // e.g., if (provider==='openai') { /* existing call */ }
    return local(); // safe default until real providers are configured
  } catch {
    return local();
  }
}

export async function generateImageWithFallback(input: GenerateImageInput): Promise<GenerateImageOutput> {
  try {
    log.info("Generating image", { prompt: input.prompt.substring(0, 50), provider: env.VITE_AI_PROVIDER });
    log.info("Environment check", {
      VITE_AI_ENABLE_IMAGE: env.VITE_AI_ENABLE_IMAGE,
      VITE_AI_PROVIDER: env.VITE_AI_PROVIDER,
      VITE_API_URL: env.VITE_API_URL
    });

    // If AI is disabled or provider is local, return mock
    if (!env.VITE_AI_ENABLE_IMAGE || env.VITE_AI_PROVIDER === "local") {
      log.info("Using local mock generation");
      const hash = btoa([input.prompt, input.style, input.negative, input.refImageUrl ?? ""].join("|")).slice(0, 12);
      const mockUrl = `https://picsum.photos/seed/${hash}/1024/768`;
      log.info("Generated mock URL", { mockUrl, hash });
      return {
        url: mockUrl,
        meta: { provider: "local", aiGenerated: true }
      };
    }

    log.info("Attempting API call to", `${env.VITE_API_URL}/ai/generate-image`);
    // For now, return local mock - API integration can be added later
    const hash = btoa([input.prompt, input.style ?? "", input.negative ?? ""].join("|")).slice(0, 12);
    const fallbackUrl = `https://picsum.photos/seed/${hash}/1024/768`;
    log.info("Generated fallback URL", { fallbackUrl, hash });
    return {
      url: fallbackUrl,
      meta: { provider: "local-fallback", aiGenerated: true }
    };
  } catch (error) {
    log.error("Failed to generate image", { error: error.message, stack: error.stack });
    // Fallback to local mock on error
    log.info("Falling back to local mock due to error");
    const hash = btoa([input.prompt, input.style ?? "", input.negative ?? ""].join("|")).slice(0, 12);
    const fallbackUrl = `https://picsum.photos/seed/${hash}/1024/768`;
    log.info("Generated fallback URL", { fallbackUrl, hash });
    return {
      url: fallbackUrl,
      meta: { provider: "local-fallback", aiGenerated: true }
    };
  }
}

// Simple mock implementations for other AI functions
export async function tagImage(input: TagImageInput): Promise<TagImageOutput> {
  try {
    log.info("Tagging image", { imageUrl: input.imageUrl?.substring(0, 50) });
    return { tags: ['art', 'creative'], confidence: 0.9 };
  } catch (error) {
    log.error("Failed to tag image", { error: error.message });
    throw error;
  }
}

export async function embed(input: EmbedInput): Promise<number[]> {
  try {
    log.info("Creating embedding", { hasText: !!input.text, hasImage: !!input.imageUrl });
    return [0.1, 0.2, 0.3]; // Mock embedding
  } catch (error) {
    log.error("Failed to create embedding", { error: error.message });
    throw error;
  }
}

export async function moderate(input: ModerateInput): Promise<ModerateOutput> {
  try {
    log.info("Moderating content", { hasText: !!input.content, hasImage: !!input.imageUrl });
    return { isAppropriate: true, confidence: 0.9 };
  } catch (error) {
    log.error("Failed to moderate content", { error: error.message });
    throw error;
  }
}

export async function similarSearch(input: SimilarSearchInput): Promise<SimilarSearchOutput[]> {
  try {
    log.info("Searching similar content", { ...input });
    return [{ id: '1', title: 'Similar artwork', score: 0.8 }];
  } catch (error) {
    log.error("Failed to search similar content", { error: error.message });
    throw error;
  }
}