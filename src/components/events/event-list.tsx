'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AcademyEvent } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';


interface EventListProps {
  events: AcademyEvent[];
  selectedEvent: AcademyEvent | null;
  onSelectEvent: (event: AcademyEvent) => void;
}

export function EventList({ events, selectedEvent, onSelectEvent }: EventListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Tournaments</CardTitle>
        <CardDescription>Select a tournament to view details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <button
            key={event.id}
            className={cn(
              'flex w-full items-center gap-4 rounded-lg border p-3 text-left transition-colors',
              selectedEvent?.id === event.id
                ? 'bg-muted ring-2 ring-primary'
                : 'hover:bg-muted/50'
            )}
            onClick={() => onSelectEvent(event)}
          >
            {event.logoUrl && (
                <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                        src={event.logoUrl}
                        alt={`${event.title} logo`}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
            )}
            <div className="flex-grow">
              <p className="font-semibold">{event.title}</p>
              <p className="text-sm text-muted-foreground">{event.subtitle}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                 <span>{event.date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                <Badge variant="outline" className="text-xs">{event.category}</Badge>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
