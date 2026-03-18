'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils'; // Make sure this import exists

interface Event {
  id: string;
  title: string;
  subtitle?: string;
  event_date: string | null; // Make sure event_date can be null
  category: string;
  venue: string;
  location: string;
  logo_url?: string;
  participant_count?: number;
}

interface EventListProps {
  events: Event[];
}

export function EventList({ events }: EventListProps) {
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No events found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Link href={`/events/${event.id}`} key={event.id}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline text-lg line-clamp-1">
                  {event.title}
                </CardTitle>
                <Badge variant="secondary">{event.category}</Badge>
              </div>
              {event.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {event.subtitle}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {event.logo_url && (
                <div className="relative h-40 w-full mb-4 rounded-md overflow-hidden">
                  <Image
                    src={event.logo_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {/* SAFE DATE FORMATTING HERE */}
                  <span className="text-muted-foreground">
                    {safeFormatDate(event.event_date, 'Date not set')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {event.venue || event.location || 'Location not specified'}
                  </span>
                </div>
                {event.participant_count !== undefined && (
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {event.participant_count} participants
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}