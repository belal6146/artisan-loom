import { Post, Artwork, Collaboration, Resource } from "@/schemas";
import type { ExploreTab, Sort, Pager, NearbyFilters } from "@/lib/filters";
import { log } from "@/lib/log";

// Unified content type for explore streams
export type ExploreItem = Post | Artwork | Collaboration | Resource;

interface ExploreResponse {
  items: ExploreItem[];
  nextCursor?: string;
  hasMore: boolean;
}

interface ExploreParams {
  cursor?: string;
  limit?: number;
  sort?: Sort;
  timeframe?: '24h' | '7d';
}

interface NearbyParams extends ExploreParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
}

class ExploreClient {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const requestId = `explore-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    try {
      log.info("Explore API request", { requestId, endpoint, params });
      
      const url = new URL(endpoint, window.location.origin);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const duration = Date.now() - startTime;
      
      log.info("Explore API success", { requestId, endpoint, duration });
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      log.error("Explore API error", { 
        requestId, 
        endpoint, 
        duration, 
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  async getForYou(params: ExploreParams = {}): Promise<ExploreResponse> {
    // Mock implementation - in real app this would be an API call
    const mockItems: ExploreItem[] = [
      // Mock posts, artworks, collaborations, resources
    ];
    
    return {
      items: mockItems.slice(0, params.limit || 20),
      nextCursor: mockItems.length > (params.limit || 20) ? 'next-page' : undefined,
      hasMore: mockItems.length > (params.limit || 20)
    };
  }

  async getFollowing(params: ExploreParams = {}): Promise<ExploreResponse> {
    // Mock implementation
    return {
      items: [],
      hasMore: false
    };
  }

  async getNearby(params: NearbyParams = {}): Promise<ExploreResponse> {
    // Mock implementation
    return {
      items: [],
      hasMore: false
    };
  }

  async getTrending(params: ExploreParams = {}): Promise<ExploreResponse> {
    // Mock implementation with timeframe support
    return {
      items: [],
      hasMore: false
    };
  }

  async getCollaborations(params: ExploreParams = {}): Promise<ExploreResponse> {
    // Mock implementation
    return {
      items: [],
      hasMore: false
    };
  }

  async getLearn(params: ExploreParams = {}): Promise<ExploreResponse> {
    // Mock implementation
    return {
      items: [],
      hasMore: false
    };
  }

  async getEventsModule(params: { city?: string; range?: number } = {}): Promise<Event[]> {
    // Mock implementation
    return [];
  }

  async getToolsModule(params: { category?: string } = {}): Promise<Tool[]> {
    // Mock implementation
    return [];
  }
}

export const exploreClient = new ExploreClient();