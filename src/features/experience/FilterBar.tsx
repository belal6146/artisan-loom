import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, Grid, List } from 'lucide-react';
import type { MediaCategory, MarketplaceFilters, EventFilters } from '@/lib/marketplace-types';

interface FilterBarProps {
  mode: 'marketplace' | 'events';
  onFiltersChange: (filters: MarketplaceFilters | EventFilters) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

const mediaCategories: MediaCategory[] = [
  'painting', 'drawing', 'printmaking', 'sculpture', 'ceramics',
  'textiles', 'photography', 'electronic', 'installation', 'glass', 'literature', 'sound', 'other'
];

const eventTypes = [
  'gallery', 'competition', 'meetup', 'class', 'seminar', 'volunteer'
] as const;

export const FilterBar = ({ mode, onFiltersChange, viewMode = 'grid', onViewModeChange }: FilterBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [city, setCity] = useState('');
  const [radiusKm, setRadiusKm] = useState([50]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (mode === 'marketplace') {
      onFiltersChange({
        q: value || undefined,
        category: selectedCategory !== 'all' ? selectedCategory as MediaCategory : undefined,
        vendorId: selectedVendor !== 'all' ? selectedVendor : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (mode === 'marketplace') {
      onFiltersChange({
        q: searchQuery || undefined,
        category: category !== 'all' ? category as MediaCategory : undefined,
        vendorId: selectedVendor !== 'all' ? selectedVendor : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
    }
  };

  const handleEventTypeChange = (type: string) => {
    setSelectedEventType(type);
    if (mode === 'events') {
      onFiltersChange({
        type: type !== 'all' ? type as (typeof eventTypes)[number] : undefined,
        city: city || undefined,
        radiusKm: radiusKm[0],
        verifiedOnly,
      });
    }
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    if (mode === 'events') {
      onFiltersChange({
        type: selectedEventType !== 'all' ? selectedEventType as (typeof eventTypes)[number] : undefined,
        city: value || undefined,
        radiusKm: radiusKm[0],
        verifiedOnly,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </div>
          {onViewModeChange && (
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={mode === 'marketplace' ? 'Search products...' : 'Search events...'}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category/Type Filter */}
        {mode === 'marketplace' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange('all')}
              >
                All
              </Button>
              {mediaCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Type</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedEventType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleEventTypeChange('all')}
              >
                All
              </Button>
              {eventTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedEventType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleEventTypeChange(type)}
                  className="capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        )}

        {mode === 'marketplace' && (
          <>
            {/* Vendor Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor</label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="All vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All vendors</SelectItem>
                  <SelectItem value="blick">Blick Art Materials</SelectItem>
                  <SelectItem value="jacksons">Jackson's Art</SelectItem>
                  <SelectItem value="cassart">Cass Art</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                step={10}
                className="w-full"
              />
            </div>
          </>
        )}

        {mode === 'events' && (
          <>
            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="Enter city name"
                value={city}
                onChange={(e) => handleCityChange(e.target.value)}
              />
            </div>

            {/* Radius */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Radius: {radiusKm[0]} km
              </label>
              <Slider
                value={radiusKm}
                onValueChange={setRadiusKm}
                max={200}
                step={5}
                className="w-full"
              />
            </div>

            {/* Verified Only */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified-only"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="verified-only" className="text-sm font-medium">
                Verified links only
              </label>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};