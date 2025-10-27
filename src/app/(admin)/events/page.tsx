'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EventList } from '@/components/events/event-list';
import { EventDetails } from '@/components/events/event-details';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { events, AcademyEvent } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventManagementTable } from '@/components/events/event-management-table';

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<AcademyEvent | null>(events[0]);

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
