import { useQuery } from "@tanstack/react-query";
import { log } from "@/lib/log";

interface EventsFilters {
  category?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface Event {
  id: string;
  title: string;
  description?: string;
  category: string;
  location: string;
  date: string;
  url: string;
  verified: boolean;
  imageUrl?: string;
}

interface UseEventsProps {
  filters?: EventsFilters;
}

export const useEvents = ({ filters }: UseEventsProps = {}) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async (): Promise<Event[]> => {
      const requestId = `events-${Date.now()}`;
      const startTime = Date.now();
      
      try {
        log.info("Events API request", { requestId, filters });
        
        const url = new URL('/api/events', window.location.origin);
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (key === 'dateRange' && typeof value === 'object') {
                url.searchParams.append('startDate', value.start);
                url.searchParams.append('endDate', value.end);
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
        
        log.info("Events API success", { requestId, duration, count: data.length });
        
        // Filter out unverified events for security
        return data.filter((event: Event) => event.verified);
      } catch (error) {
        const duration = Date.now() - startTime;
        log.error("Events API error", { 
          requestId, 
          duration, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        // Return mock data for development
        return [
          {
            id: 'mock-1',
            title: 'Contemporary Art Exhibition',
            description: 'Explore the latest in contemporary art from emerging artists.',
            category: 'Gallery',
            location: 'Modern Art Museum, NYC',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://example-gallery.com/exhibition',
            verified: true,
            imageUrl: '/placeholder.svg'
          },
          {
            id: 'mock-2',
            title: 'Digital Art Workshop',
            description: 'Learn digital painting techniques with industry professionals.',
            category: 'Workshop',
            location: 'Art Center, San Francisco',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            url: 'https://example-workshops.com/digital-art',
            verified: true
          }
        ];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};