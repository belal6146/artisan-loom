import { useQuery } from "@tanstack/react-query";
import { log } from "@/lib/log";

interface ToolsFilters {
  vendor?: string;
  category?: string;
  minRating?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  sort?: 'relevance' | 'rating' | 'price';
}

interface Vendor {
  id: string;
  name: string;
  domain: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
}

interface ToolProduct {
  id: string;
  vendorId: string;
  vendor?: Vendor;
  title: string;
  description?: string;
  category: string;
  imageUrl?: string;
  price?: {
    amount: number;
    currency: string;
  };
  rating: number;
  reviewsCount: number;
  url: string;
}

interface UseToolsProps {
  filters?: ToolsFilters;
}

export const useTools = ({ filters }: UseToolsProps = {}) => {
  return useQuery({
    queryKey: ['tools', filters],
    queryFn: async (): Promise<ToolProduct[]> => {
      const requestId = `tools-${Date.now()}`;
      const startTime = Date.now();
      
      try {
        log.info("Tools API request", { requestId, filters });
        
        const url = new URL('/api/tools', window.location.origin);
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (key === 'priceRange' && typeof value === 'object') {
                url.searchParams.append('minPrice', value.min.toString());
                url.searchParams.append('maxPrice', value.max.toString());
              } else {
                url.searchParams.append(key, String(value));
              }
            }
          });
        }
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const duration = Date.now() - startTime;
        
        log.info("Tools API success", { requestId, duration, count: data.length });
        
        // Filter out unverified vendors for security
        return data.filter((tool: ToolProduct) => tool.vendor?.verified);
      } catch (error) {
        const duration = Date.now() - startTime;
        log.error("Tools API error", { 
          requestId, 
          duration, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        // Return mock data for development
        return [
          {
            id: 'mock-tool-1',
            vendorId: 'vendor-1',
            vendor: {
              id: 'vendor-1',
              name: 'Art Supply Co',
              domain: 'artsupply.example',
              verified: true,
              rating: 4.8,
              reviewsCount: 1247
            },
            title: 'Professional Watercolor Set',
            description: 'High-quality watercolor paints perfect for professional artists.',
            category: 'Paint',
            imageUrl: '/placeholder.svg',
            price: {
              amount: 89.99,
              currency: 'USD'
            },
            rating: 4.7,
            reviewsCount: 324,
            url: 'https://artsupply.example/watercolor-set'
          },
          {
            id: 'mock-tool-2',
            vendorId: 'vendor-2',
            vendor: {
              id: 'vendor-2',
              name: 'Canvas World',
              domain: 'canvasworld.example',
              verified: true,
              rating: 4.6,
              reviewsCount: 892
            },
            title: 'Premium Canvas Boards',
            description: 'Acid-free canvas boards suitable for all painting mediums.',
            category: 'Canvas',
            price: {
              amount: 24.99,
              currency: 'USD'
            },
            rating: 4.5,
            reviewsCount: 156,
            url: 'https://canvasworld.example/canvas-boards'
          }
        ];
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};