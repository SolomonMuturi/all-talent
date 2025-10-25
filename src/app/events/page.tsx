import { EventCalendar } from "@/components/events/event-calendar";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Events & Scheduling</h1>
        <p className="text-muted-foreground">
          Manage training, matches, and tournaments.
        </p>
      </div>
      <EventCalendar />
    </div>
  );
}
