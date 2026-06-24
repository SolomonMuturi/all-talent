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
  event_date: string | null;
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
  description?: string;
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
      setError(null);
      
      const response = await fetch('/api/events?limit=100');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch events`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const formattedEvents = data.data.events.map((event: any) => ({
          ...event,
          event_date: event.event_date || null,
          subtitle: event.subtitle || '',
          location: event.location || '',
          venue: event.venue || '',
          country: event.country || '',
          game_type: event.game_type || '',
          tournament_type: event.tournament_type || 'N/A',
          team_count: event.team_count || 0,
          lineup_formation: event.lineup_formation || '',
          lineup_squad: event.lineup_squad || [],
          description: event.description || '',
        }));
        
        setEvents(formattedEvents);
        if (formattedEvents.length > 0) {
          setSelectedEvent(formattedEvents[0]);
        }
      } else {
        setError(data.error || 'Failed to load events from API');
      }
    } catch (err) {
      console.error('Fetch events error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
        
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Events</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchEvents}>Retry</Button>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
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
        
        <div className="rounded-lg border border-dashed p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
          <p className="text-muted-foreground mb-4">
            There are no events available. Create your first event to get started.
          </p>
          <Button asChild>
            <Link href="/events/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Event
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
        
        <TabsContent value="marketplace" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-lg border border-dashed p-8 text-muted-foreground">
                  <p className="mb-2">Select an event to see the details</p>
                  <p className="text-sm">Click on any event from the list on the left</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="manage" className="mt-6">
          <EventManagementTable events={events} />
        </TabsContent>
      </Tabs>
    </div>
  );
}