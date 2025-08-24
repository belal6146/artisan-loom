import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, ExternalLink } from "lucide-react";

// Mock events data
const mockEvents = [
  {
    id: "1",
    title: "Contemporary Art Gallery Opening",
    type: "gallery" as const,
    description: "Join us for the opening of 'Urban Perspectives', featuring works by emerging artists exploring city life through various mediums.",
    startsAt: "2024-01-28T18:00:00Z",
    endsAt: "2024-01-28T22:00:00Z",
    location: "Modern Art Gallery Barcelona",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop",
    url: "https://example.com/gallery-opening",
    attendees: 156,
  },
  {
    id: "2", 
    title: "Digital Art Competition 2024",
    type: "competition" as const,
    description: "Annual digital art competition with €5,000 in prizes. Submit your best digital artwork and compete with artists worldwide.",
    startsAt: "2024-02-01T00:00:00Z",
    endsAt: "2024-02-28T23:59:59Z",
    location: "Online",
    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop",
    url: "https://example.com/competition",
    attendees: 2341,
  },
  {
    id: "3",
    title: "Local Artists Meetup",
    type: "meetup" as const,
    description: "Monthly gathering for local artists to network, share experiences, and collaborate on future projects.",
    startsAt: "2024-02-05T19:00:00Z",
    endsAt: "2024-02-05T21:00:00Z",
    location: "Café Artístico, Madrid",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    attendees: 45,
  },
  {
    id: "4",
    title: "Abstract Painting Workshop",
    type: "class" as const,
    description: "Learn abstract painting techniques in this hands-on workshop. All materials provided. Suitable for beginners and intermediate artists.",
    startsAt: "2024-02-10T14:00:00Z",
    endsAt: "2024-02-10T17:00:00Z",
    location: "Art Studio Barcelona",
    imageUrl: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=400&fit=crop",
    attendees: 18,
    maxAttendees: 20,
  },
  {
    id: "5",
    title: "Art Business Seminar",
    type: "seminar" as const,
    description: "Learn how to turn your artistic passion into a sustainable business. Topics include pricing, marketing, and building client relationships.",
    startsAt: "2024-02-15T10:00:00Z",
    endsAt: "2024-02-15T16:00:00Z",
    location: "Business Center Valencia",
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=400&fit=crop",
    attendees: 87,
  },
  {
    id: "6",
    title: "Community Mural Project",
    type: "volunteer" as const,
    description: "Help create a community mural that celebrates local culture and diversity. No experience required - just enthusiasm!",
    startsAt: "2024-02-18T09:00:00Z",
    endsAt: "2024-02-18T15:00:00Z",
    location: "Community Center, Seville",
    attendees: 23,
  },
];

const getEventTypeColor = (type: string) => {
  const colors = {
    gallery: "bg-purple-100 text-purple-800",
    competition: "bg-yellow-100 text-yellow-800", 
    meetup: "bg-blue-100 text-blue-800",
    class: "bg-green-100 text-green-800",
    seminar: "bg-orange-100 text-orange-800",
    volunteer: "bg-pink-100 text-pink-800",
  };
  return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
};

export default function Experience() {
  return (
    <AppLayout>
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-display">Experience Art</h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Discover galleries, competitions, workshops, and events happening in your area and online.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm">All Events</Button>
            <Button variant="ghost" size="sm">Galleries</Button>
            <Button variant="ghost" size="sm">Competitions</Button>
            <Button variant="ghost" size="sm">Meetups</Button>
            <Button variant="ghost" size="sm">Classes</Button>
            <Button variant="ghost" size="sm">Seminars</Button>
            <Button variant="ghost" size="sm">Volunteer</Button>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockEvents.map((event) => (
              <Card key={event.id} className="shadow-soft hover:shadow-medium transition-all duration-300">
                {event.imageUrl && (
                  <div className="aspect-[2/1] overflow-hidden rounded-t-lg">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-heading">{event.title}</CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize ${getEventTypeColor(event.type)}`}
                      >
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-body text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                  
                  {/* Event Details */}
                  <div className="space-y-2 text-caption text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.startsAt).toLocaleDateString()} at{' '}
                        {new Date(event.startsAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Duration: {Math.round(
                          (new Date(event.endsAt).getTime() - new Date(event.startsAt).getTime()) / 
                          (1000 * 60 * 60)
                        )} hours
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.attendees} attending
                        {event.maxAttendees && ` • ${event.maxAttendees - event.attendees} spots left`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1">
                      {event.type === 'competition' ? 'Enter Competition' : 
                       event.type === 'volunteer' ? 'Volunteer' : 'Attend Event'}
                    </Button>
                    {event.url && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Load more events
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}