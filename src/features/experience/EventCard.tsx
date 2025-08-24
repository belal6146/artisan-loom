import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, ExternalLink, ShieldCheck } from 'lucide-react';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onOpenWebsite: (url: string) => void;
  onViewOnMap: (lat?: number, lng?: number, location?: string) => void;
}

export const EventCard = ({ event, onOpenWebsite, onViewOnMap }: EventCardProps) => {
  const getEventTypeColor = (type: string) => {
    const colors = {
      gallery: 'bg-purple-100 text-purple-800',
      competition: 'bg-yellow-100 text-yellow-800', 
      meetup: 'bg-blue-100 text-blue-800',
      class: 'bg-green-100 text-green-800',
      seminar: 'bg-orange-100 text-orange-800',
      volunteer: 'bg-pink-100 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const hours = Math.round((endTime - startTime) / (1000 * 60 * 60));
    return hours;
  };

  const startDateTime = formatDateTime(event.startsAt);
  const duration = calculateDuration(event.startsAt, event.endsAt);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="aspect-[2/1] overflow-hidden rounded-t-lg">
          <img
            src={event.imageUrl}
            alt={event.title}
            width={400}
            height={200}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={`capitalize ${getEventTypeColor(event.type)}`}
              >
                {event.type}
              </Badge>
              {event.verified && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-green-600" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{startDateTime.date} at {startDateTime.time}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Duration: {duration} hours</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{event.venue || event.location}</span>
          </div>
          
          {event.attendees !== undefined && (
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>
                {event.attendees} attending
                {event.maxAttendees && ` • ${event.maxAttendees - event.attendees} spots left`}
              </span>
            </div>
          )}
        </div>

        {/* Domain Badge */}
        {event.url && (
          <Badge variant="outline" className="text-xs">
            {getDomain(event.url)}
          </Badge>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1" size="sm">
            {event.type === 'competition' ? 'Enter Competition' : 
             event.type === 'volunteer' ? 'Volunteer' : 'Attend Event'}
          </Button>
          
          {event.url && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenWebsite(event.url!)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewOnMap(event.lat, event.lng, event.location)}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};