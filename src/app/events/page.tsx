import { EventCalendar } from "@/components/events/event-calendar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Calendar, CalendarCheck } from "lucide-react";
import { events } from "@/lib/data";
import { UpcomingEvents } from "@/components/events/upcoming-events";

export default function EventsPage() {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingEventsCount = events.filter(event => {
    return event.date >= today && event.date <= nextWeek;
  }).length;

  const totalEventsCount = events.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Events & Scheduling</h1>
        <p className="text-muted-foreground">
          Manage training, matches, and tournaments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <KpiCard 
          title="Upcoming Events (Next 7 Days)"
          value={String(upcomingEventsCount)}
          icon={<CalendarCheck className="size-5 text-muted-foreground" />}
          description="Matches, training, and other events"
        />
        <KpiCard 
          title="Total Scheduled Events"
          value={String(totalEventsCount)}
          icon={<Calendar className="size-5 text-muted-foreground" />}
          description="In the current calendar view"
        />
      </div>

      <EventCalendar />
      <UpcomingEvents />
    </div>
  );
}
