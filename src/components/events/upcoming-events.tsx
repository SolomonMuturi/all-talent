'use client';

import { useState, useEffect } from 'react';
import { events, type AcademyEvent } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

const calculateCountdown = (eventDate: Date) => {
  const now = new Date();
  const difference = eventDate.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, passed: false };
};

const Countdown = ({ eventDate }: { eventDate: Date }) => {
  const [countdown, setCountdown] = useState(calculateCountdown(eventDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(eventDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [eventDate]);

  if (countdown.passed) {
    return <span className="text-muted-foreground">Event has passed</span>;
  }

  return (
    <div className="flex items-center space-x-2 text-sm font-mono">
      <span>{String(countdown.days).padStart(2, '0')}d</span>
      <span>{String(countdown.hours).padStart(2, '0')}h</span>
      <span>{String(countdown.minutes).padStart(2, '0')}m</span>
      <span>{String(countdown.seconds).padStart(2, '0')}s</span>
    </div>
  );
};

export function UpcomingEvents() {
  const upcomingEvents = events
    .filter(event => event.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);
    
  const categoryVariant = {
      Match: 'default',
      Training: 'secondary',
      Social: 'outline',
      Trial: 'destructive'
  } as const;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Clock className="size-5" />
            Upcoming Events
        </CardTitle>
        <CardDescription>A list of the next 5 scheduled events with a live countdown.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-right">Countdown</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                    <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>
                            <Badge variant={categoryVariant[event.category]}>{event.category}</Badge>
                        </TableCell>
                        <TableCell>{format(event.date, "PPP p")}</TableCell>
                        <TableCell className="text-right">
                            <Countdown eventDate={event.date} />
                        </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No upcoming events scheduled.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
