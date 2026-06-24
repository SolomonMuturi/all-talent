'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  subtitle?: string;
  event_date: string | null;
  category: string;
  venue: string;
  location: string;
  logo_url?: string;
  participant_count?: number;
}

interface EventListProps {
  events: Event[];
  selectedEvent: Event | null;
  onSelectEvent: (event: Event) => void;
}

export function EventList({ events, selectedEvent, onSelectEvent }: EventListProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No events found.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Date error';
    }
  };

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => ({ ...prev, [eventId]: true }));
  };

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const hasImage = event.logo_url && event.logo_url.trim() !== '';
        const hasError = imageErrors[event.id];
        const showImage = hasImage && !hasError;

        return (
          <Card 
            key={event.id}
            className={cn(
              "hover:shadow-lg transition-shadow cursor-pointer",
              selectedEvent?.id === event.id && "border-2 border-primary shadow-lg"
            )}
            onClick={() => onSelectEvent(event)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline text-base line-clamp-1">
                  {event.title}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {event.category}
                </Badge>
              </div>
              {event.subtitle && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {event.subtitle}
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {showImage ? (
                <div className="relative h-24 w-full mb-3 rounded-md overflow-hidden bg-muted">
                  <Image
                    src={event.logo_url!}
                    alt={event.title}
                    fill
                    className="object-contain"
                    onError={() => handleImageError(event.id)}
                    unoptimized={event.logo_url?.startsWith('/uploads/') || event.logo_url?.startsWith('data:')}
                  />
                </div>
              ) : (
                <div className="h-24 w-full mb-3 rounded-md bg-muted flex flex-col items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground mt-1">No Image</span>
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs">
                    {formatDate(event.event_date)}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground text-xs truncate">
                    {event.venue || event.location || 'Location not specified'}
                  </span>
                </div>
                {event.participant_count !== undefined && (
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      {event.participant_count} participants
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}