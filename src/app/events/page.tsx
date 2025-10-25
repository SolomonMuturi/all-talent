'use client';

import { useState } from 'react';
import { EventList } from '@/components/events/event-list';
import { EventDetails } from '@/components/events/event-details';
import { LiveUpdateBanner } from '@/components/events/live-update-banner';
import { events, AcademyEvent } from '@/lib/data';

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<AcademyEvent>(events[0]);

  return (
    <div className="space-y-6">
      <LiveUpdateBanner />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <EventList
            events={events}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedEvent && <EventDetails event={selectedEvent} />}
        </div>
      </div>
    </div>
  );
}
