import { useState } from 'react';
import { FilterBar } from './FilterBar';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/lib/log';
import type { Event } from '@/types';
import type { EventFilters } from '@/lib/marketplace-types';

// Mock events data with safety checks
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Contemporary Art Gallery Opening",
    type: "gallery",
    description: "Join us for the opening of 'Urban Perspectives', featuring works by emerging artists exploring city life through various mediums.",
    startsAt: "2024-01-28T18:00:00Z",
    endsAt: "2024-01-28T22:00:00Z",
    location: "Modern Art Gallery Barcelona",
    venue: "Modern Art Gallery",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop",
    url: "https://example.com/gallery-opening",
    attendees: 156,
    verified: true,
    verdict: "ok",
  },
  {
    id: "2", 
    title: "Digital Art Competition 2024",
    type: "competition",
    description: "Annual digital art competition with €5,000 in prizes. Submit your best digital artwork and compete with artists worldwide.",
    startsAt: "2024-02-01T00:00:00Z",
    endsAt: "2024-02-28T23:59:59Z",
    location: "Online",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop",
    url: "https://digitalartcomp.com/2024",
    attendees: 2341,
    verified: true,
    verdict: "ok",
  },
  {
    id: "3",
    title: "Local Artists Meetup",
    type: "meetup",
    description: "Monthly gathering for local artists to network, share experiences, and collaborate on future projects.",
    startsAt: "2024-02-05T19:00:00Z",
    endsAt: "2024-02-05T21:00:00Z",
    location: "Café Artístico, Madrid",
    venue: "Café Artístico",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    attendees: 45,
    verified: false,
    verdict: "suspicious",
  },
];

export const EventsTab = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<EventFilters>({ verifiedOnly: true });
  const { toast } = useToast();

  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    // Apply filters to events
    let filteredEvents = mockEvents;
    
    if (newFilters.verifiedOnly) {
      filteredEvents = filteredEvents.filter(event => event.verified);
    }
    
    if (newFilters.type) {
      filteredEvents = filteredEvents.filter(event => event.type === newFilters.type);
    }
    
    setEvents(filteredEvents);
    log.info('Events filtered', { filters: newFilters, count: filteredEvents.length });
  };

  const handleOpenWebsite = (url: string) => {
    log.info('Opening external event website', { domain: new URL(url).hostname });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewOnMap = (lat?: number, lng?: number, location?: string) => {
    const mapUrl = lat && lng 
      ? `https://maps.google.com/?q=${lat},${lng}`
      : `https://maps.google.com/?q=${encodeURIComponent(location || '')}`;
    
    log.info('Opening map view', { hasCoordinates: !!(lat && lng), location });
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FilterBar
        mode="events"
        onFiltersChange={handleFiltersChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {events.length} events
          {filters.verifiedOnly && ' (verified links only)'}
        </p>
      </div>

      {/* Events Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
          : 'space-y-4'
      }>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onOpenWebsite={handleOpenWebsite}
            onViewOnMap={handleViewOnMap}
          />
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No events found matching your criteria.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => handleFiltersChange({ verifiedOnly: false })}
          >
            Show all events
          </Button>
        </div>
      )}

      {/* Load More */}
      {events.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load more events
          </Button>
        </div>
      )}
    </div>
  );
};