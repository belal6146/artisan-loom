import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnifiedCard } from "@/features/explore/cards/UnifiedCard";
import { InlineSkeleton } from "@/components/common/InlineSkeleton";
import { useNearbyStream } from "./useNearbyStream";
import type { Sort, Pager, NearbyFilters } from "@/lib/filters";
import { MapPin, Navigation } from "lucide-react";

interface NearbyStreamProps {
  sort: Sort;
  pager: Pager;
  onItemAction?: (action: string, itemId: string) => void;
  className?: string;
}

export const NearbyStream = ({ sort, pager, onItemAction, className }: NearbyStreamProps) => {
  const [filters, setFilters] = useState<NearbyFilters>({
    radiusKm: 25
  });
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useNearbyStream({ 
    sort, 
    pager, 
    filters 
  });

  const items = data?.pages.flatMap(page => page.items) ?? [];
  const hasLocation = !!(filters.lat && filters.lng);

  const requestLocation = () => {
    setIsRequestingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }));
          setIsRequestingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          setIsRequestingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setIsRequestingLocation(false);
    }
  };

  const handleItemAction = (action: string, itemId: string) => {
    onItemAction?.(action, itemId);
  };

  if (!hasLocation) {
    return (
      <div className={`text-center py-12 space-y-6 ${className}`}>
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Discover nearby content</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Allow location access to see posts, artworks, and events near you.
          </p>
        </div>
        <Button 
          onClick={requestLocation}
          disabled={isRequestingLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          {isRequestingLocation ? 'Getting location...' : 'Enable Location'}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <InlineSkeleton count={5} className={className} />;
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground mb-4">Failed to load nearby content</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Distance filter */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <span className="text-sm font-medium">Distance:</span>
        <Select
          value={filters.radiusKm?.toString()}
          onValueChange={(value) => setFilters(prev => ({ ...prev, radiusKm: parseInt(value) }))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 km</SelectItem>
            <SelectItem value="25">25 km</SelectItem>
            <SelectItem value="100">100 km</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No content found nearby. Try expanding your search radius.</p>
        </div>
      ) : (
        <>
          {items.map((item, index) => (
            <UnifiedCard
              key={`${item.id}-${index}`}
              item={item}
              onLike={(id) => handleItemAction('like', id)}
              onSave={(id) => handleItemAction('save', id)}
              onFollow={(id) => handleItemAction('follow', id)}
            />
          ))}
          
          {hasNextPage && (
            <div className="text-center py-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
          
          {isFetchingNextPage && <InlineSkeleton count={3} />}
        </>
      )}
    </div>
  );
};