import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DomainBadge } from "@/components/common/DomainBadge";
import { InlineSkeleton } from "@/components/common/InlineSkeleton";
import { track } from "@/lib/track";
import { useEvents } from "./useEvents";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

const categories = [
  'All',
  'Galleries',
  'Competitions', 
  'Meetups',
  'Classes',
  'Seminars',
  'Volunteer'
];

export const EventsList = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const { data: events, isLoading, error } = useEvents({
    filters: {
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined
    }
  });

  const handleEventVisit = (eventId: string, url: string) => {
    track("event_visit", { id: eventId, domain: new URL(url).hostname });
  };

  if (isLoading) {
    return <InlineSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Failed to load events</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const filteredEvents = events || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Find Events</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                <SelectItem value="New York">New York</SelectItem>
                <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                <SelectItem value="London">London</SelectItem>
                <SelectItem value="Paris">Paris</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-smooth">
              <CardContent className="p-4">
                {event.imageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-4">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={300}
                      height={200}
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-2 flex-1">{event.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <DomainBadge url={event.url} verified={event.verified} />
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                        onClick={() => handleEventVisit(event.id, event.url)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Visit site
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};