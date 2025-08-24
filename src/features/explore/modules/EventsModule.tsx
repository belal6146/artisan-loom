import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DomainBadge } from "@/components/common/DomainBadge";
import { exploreClient } from "@/lib/exploreClient";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

interface EventsModuleProps {
  city?: string;
  range?: number;
  className?: string;
}

export const EventsModule = ({ city, range = 25, className }: EventsModuleProps) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['events-module', city, range],
    queryFn: () => exploreClient.getEventsModule({ city, range }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading || !events || events.length === 0) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events near you
          </h3>
          <Button variant="ghost" size="sm" asChild>
            <a href="/experience?tab=events">
              View all
            </a>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.slice(0, 3).map((event: any) => (
            <div key={event.id} className="p-3 bg-background rounded-lg border">
              <div className="space-y-2">
                <h4 className="font-medium text-sm line-clamp-2">{event.title}</h4>
                
                <div className="space-y-1 text-xs text-muted-foreground">
                  {event.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <DomainBadge 
                    url={event.url} 
                    verified={event.verified}
                    showIcon={false}
                    className="text-xs"
                  />
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Visit
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};