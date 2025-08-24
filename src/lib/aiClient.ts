// AI Client - Frontend interface for AI services
import { apiClient } from "./api-client";
import { log } from "./log";
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
  AIJob,
} from "@/types/ai";

class AIClient {
  async generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    try {
      log.info("Generating image", { prompt: input.prompt.substring(0, 50) });
      const response = await apiClient.post<GenerateImageOutput>("/ai/generate-image", input);
      return response;
    } catch (error) {
      log.error("Failed to generate image", { error: error.message });
      throw error;
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

  streamJob(jobId: string): EventSource {
    const eventSource = new EventSource(`/api/ai/jobs/${jobId}/stream`);
    
    eventSource.addEventListener("error", (event) => {
      log.error("Job stream error", { jobId, event });
    });

    return eventSource;
  }

  async getJob(jobId: string): Promise<AIJob> {
    try {
      const response = await apiClient.get<AIJob>(`/ai/jobs/${jobId}`);
      return response;
    } catch (error) {
      log.error("Failed to get job", { jobId, error: error.message });
      throw error;
    }
  }
}

export const aiClient = new AIClient();