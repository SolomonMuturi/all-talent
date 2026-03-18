'use client';

import { useEffect, useState } from "react";
import { TicketBookingForm } from "@/components/ticketing/ticket-booking-form";
import { notFound, useSearchParams } from "next/navigation";

export function BookTicketClient() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      try {
        let url = "/api/events";
        if (eventId) {
          url += `/${eventId}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Event not found");
          setEvent(await res.json());
        } else {
          // Fetch all events and pick the first with "U-17" in the title
          const res = await fetch(url);
          if (!res.ok) throw new Error("Events not found");
          const events = await res.json();
          const defaultEvent = events.find((e: any) => e.title.includes("U-17"));
          setEvent(defaultEvent || null);
        }
      } catch {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  if (loading) return <div>Loading...</div>;
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
