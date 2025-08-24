// AI Client - Frontend interface for AI services
import { apiClient } from "./api-client";
import { log } from "./log";
import { env } from "./env";
import type {
  GenerateImageInput,
  GenerateImageOutput,
  TagImageInput,
  TagImageOutput,
  EmbedInput,
  ModerateInput,
  ModerateOutput,
  SimilarSearchInput,
  SimilarSearchResult,
} from "@/types/ai";

class AIClient {
  async generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    try {
      log.info("Generating image", { prompt: input.prompt.substring(0, 50), provider: env.VITE_AI_PROVIDER });
      
      // If AI is disabled or provider is local, return mock
      if (!env.VITE_AI_ENABLE_IMAGE || env.VITE_AI_PROVIDER === "local") {
        const hash = btoa([input.prompt, input.style, input.negative, input.refImageUrl ?? ""].join("|")).slice(0, 12);
        return {
          url: `https://picsum.photos/seed/${hash}/1024/768`,
          meta: { provider: "local", aiGenerated: true }
        };
      }

      const response = await apiClient.post<GenerateImageOutput>("/ai/generate-image", input);
      return response;
    } catch (error) {
      log.error("Failed to generate image", { error: error.message });
      // Fallback to local mock on error
      const hash = btoa([input.prompt, input.style ?? "", input.negative ?? ""].join("|")).slice(0, 12);
      return {
        url: `https://picsum.photos/seed/${hash}/1024/768`,
        meta: { provider: "local-fallback", aiGenerated: true }
      };
    }
  }

  async tagImage(input: TagImageInput): Promise<TagImageOutput> {
    try {
      log.info("Tagging image", { imageUrl: input.imageUrl.substring(0, 50) });
      const response = await apiClient.post<TagImageOutput>("/ai/tag-image", input);
      return response;
    } catch (error) {
      log.error("Failed to tag image", { error: error.message });
      throw error;
    }
  }

  async embed(input: EmbedInput): Promise<number[]> {
    try {
      log.info("Creating embedding", { hasText: !!input.text, hasImage: !!input.imageUrl });
      const response = await apiClient.post<number[]>("/ai/embed", input);
      return response;
    } catch (error) {
      log.error("Failed to create embedding", { error: error.message });
      throw error;
    }
  }

  async moderate(input: ModerateInput): Promise<ModerateOutput> {
    try {
      log.info("Moderating content", { hasText: !!input.text, hasImage: !!input.imageUrl });
      const response = await apiClient.post<ModerateOutput>("/ai/moderate", input);
      return response;
    } catch (error) {
      log.error("Failed to moderate content", { error: error.message });
      throw error;
    }
  }

  async similarSearch(input: SimilarSearchInput): Promise<SimilarSearchResult[]> {
    try {
      log.info("Searching similar content", { ...input });
      const response = await apiClient.post<SimilarSearchResult[]>("/search/similar", input);
      return response;
    } catch (error) {
      log.error("Failed to search similar content", { error: error.message });
      throw error;
    }
  }
}

export const aiClient = new AIClient();