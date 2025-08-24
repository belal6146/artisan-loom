import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, MapPin, Star } from "lucide-react";
import { storage } from "@/lib/storage";
import { StarRating } from "@/components/common/StarRating";
import { DomainBadge } from "@/components/common/DomainBadge";

// Verified domains for security
const VERIFIED_DOMAINS = new Set([
  "blick.com",
  "jacksonsart.com", 
  "cassart.co.uk",
  "dickblick.com",
  "jerrysartarama.com"
]);

function isVerifiedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return VERIFIED_DOMAINS.has(hostname);
  } catch {
    return false;
  }
}

export function EventsList() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", "verified"],
    queryFn: async () => {
      // In dev, return mock verified events
      const mockEvents = [
        {
          id: 'e_1',
          title: 'Contemporary Art Exhibition',
          type: 'gallery',
          location: 'Modern Art Museum, NYC',
          startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://cassart.co.uk/events/contemporary-art',
          verified: true
        },
        {
          id: 'e_2', 
          title: 'Digital Painting Workshop',
          type: 'workshop',
          location: 'Art Center, San Francisco',
          startsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://blick.com/workshops/digital-painting',
          verified: true
        },
        {
          id: 'e_3',
          title: 'Sculpture Competition 2024',
          type: 'competition', 
          location: 'Online',
          startsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          url: 'https://jacksonsart.com/competitions/sculpture',
          verified: true
        }
      ];
      
      // Filter to only verified events
      return mockEvents.filter(event => event.verified && isVerifiedDomain(event.url));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Loading events">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="events-list">
      {events.length === 0 ? (
        <Card className="p-6 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-2">No Events Found</h3>
          <p className="text-muted-foreground text-sm">
            Check back later for verified art events and workshops.
          </p>
        </Card>
      ) : (
        events.map((event) => (
          <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold truncate">{event.title}</h3>
                  <DomainBadge verified={true} url={event.url} />
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.startsAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {event.type}
                </Badge>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                asChild
                className="flex-shrink-0 active:scale-95 transition-transform"
              >
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit
                </a>
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export function ToolsMarketplace() {
  const { data, isLoading } = useQuery({
    queryKey: ["tools", "verified"],
    queryFn: async () => {
      // Mock verified tools and vendors
      const vendors = [
        {
          id: 'v_blick',
          name: 'Blick Art Materials',
          domain: 'blick.com',
          verified: true,
          rating: 4.7,
          reviewsCount: 1203
        },
        {
          id: 'v_jacksons',
          name: "Jackson's Art Supplies",
          domain: 'jacksonsart.com', 
          verified: true,
          rating: 4.6,
          reviewsCount: 987
        }
      ];

      const tools = [
        {
          id: 't_brush1',
          vendorId: 'v_blick',
          title: 'Professional Round Brush Set',
          description: 'High-quality synthetic brushes perfect for watercolor and acrylic',
          imageUrl: '/placeholder.svg',
          rating: 4.5,
          reviewsCount: 324,
          url: 'https://blick.com/products/professional-brush-set',
          price: { amount: 2499, currency: 'USD' },
          category: 'Brushes'
        },
        {
          id: 't_canvas1', 
          vendorId: 'v_jacksons',
          title: 'Premium Cotton Canvas',
          description: 'Acid-free cotton canvas suitable for all painting mediums',
          imageUrl: '/placeholder.svg',
          rating: 4.8,
          reviewsCount: 156,
          url: 'https://jacksonsart.com/products/cotton-canvas',
          price: { amount: 3200, currency: 'USD' },
          category: 'Canvas'
        },
        {
          id: 't_paint1',
          vendorId: 'v_blick',
          title: 'Artist Acrylic Paint Set',
          description: 'Professional-grade acrylic paints with excellent lightfastness',
          imageUrl: '/placeholder.svg', 
          rating: 4.6,
          reviewsCount: 789,
          url: 'https://blick.com/products/acrylic-paint-set',
          price: { amount: 4999, currency: 'USD' },
          category: 'Paint'
        }
      ];

      // Filter to verified vendors only
      const verifiedVendors = vendors.filter(v => v.verified);
      const verifiedTools = tools.filter(t => {
        const vendor = vendors.find(v => v.id === t.vendorId);
        return vendor?.verified && isVerifiedDomain(t.url);
      });

      return { vendors: verifiedVendors, tools: verifiedTools };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Loading tools">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const tools = data?.tools || [];
  const vendors = new Map(data?.vendors.map(v => [v.id, v]) || []);

  return (
    <div className="space-y-6" data-testid="tools-marketplace">
      {tools.length === 0 ? (
        <Card className="p-8 text-center">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-2">No Tools Available</h3>
          <p className="text-muted-foreground">
            Check back later for curated art supplies from verified vendors.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const vendor = vendors.get(tool.vendorId);
            if (!vendor?.verified) return null;

            return (
              <Card key={tool.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid="tool-card">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={tool.imageUrl}
                    alt={tool.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width={400}
                    height={225}
                  />
                  <div className="absolute top-3 right-3">
                    <DomainBadge verified={vendor.verified} url={tool.url} data-testid="vendor-badge" />
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold truncate">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{vendor.name}</p>
                  </div>
                  
                  {tool.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StarRating 
                        rating={tool.rating} 
                        showCount={true} 
                        reviewsCount={tool.reviewsCount}
                        size="sm"
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-lg font-semibold">
                      {tool.price.currency} {(tool.price.amount / 100).toFixed(2)}
                    </div>
                    <Button 
                      size="sm" 
                      asChild
                      className="active:scale-95 transition-transform"
                    >
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Shop
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}