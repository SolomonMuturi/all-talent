'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EventList } from '@/components/events/event-list';
import { EventDetails } from '@/components/events/event-details';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventManagementTable } from '@/components/events/event-management-table';

interface AcademyEvent {
  id: string;
  title: string;
  subtitle?: string;
  organizer: string;
  event_date: string;
  category: string;
  logo_url?: string;
  country?: string;
  location?: string;
  venue?: string;
  game_type?: string;
  tournament_type?: string;
  team_count?: number;
  lineup_formation?: string;
  lineup_squad?: any[];
  created_at: string;
  updated_at: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<AcademyEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AcademyEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?limit=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data.events);
        setSelectedEvent(data.data.events[0] || null);
      } else {
        setError(data.error || 'Failed to load events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Events & Ticketing</h1>
          <p className="text-muted-foreground">
            Browse the marketplace or manage your created events.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

       <Tabs defaultValue="marketplace">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="manage">Manage Events</TabsTrigger>
        </TabsList>
        <TabsContent value="marketplace">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                <div className="lg:col-span-1">
                <EventList
                    events={events}
                    selectedEvent={selectedEvent}
                    onSelectEvent={setSelectedEvent}
                />
                </div>
                <div className="lg:col-span-2">
                {selectedEvent ? (
                    <EventDetails event={selectedEvent} />
                ) : (
                    <div className="flex items-center justify-center h-full rounded-lg border border-dashed text-muted-foreground">
                    Select an event to see the details
                    </div>
                )}
                </div>
            </div>
        </TabsContent>
        <TabsContent value="manage">
            <EventManagementTable events={events} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
