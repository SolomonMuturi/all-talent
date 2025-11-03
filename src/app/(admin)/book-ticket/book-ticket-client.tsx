'use client';

import { TicketBookingForm } from "@/components/ticketing/ticket-booking-form";
import { events } from "@/lib/data";
import { notFound, useSearchParams } from "next/navigation";

export function BookTicketClient() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  
  // For now, we'll default to the first event if none is specified
  // In a real app, you'd likely want a dedicated page for event selection
  const event = eventId ? events.find(e => e.id === eventId) : events.find(e => e.title.includes("U-17"));

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Book Your Ticket</h1>
        <p className="text-muted-foreground">
          Secure your spot for the {event.title}.
        </p>
      </div>
      <TicketBookingForm event={event} />
    </div>
  );
}
