import { EventCalendar } from "@/components/events/event-calendar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Calendar, CalendarCheck } from "lucide-react";

const events = {
  '2024-08-05': [{ time: '10:00 AM', title: 'U-17 Training' }],
  '2024-08-07': [{ time: '02:00 PM', title: 'U-19 Friendly Match vs. Gor Mahia Youth' }],
  '2024-08-10': [
    { time: '09:00 AM', title: 'U-15 Trials' },
    { time: '12:00 PM', title: 'Team Lunch' },
  ],
};

export default function EventsPage() {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const upcomingEventsCount = Object.keys(events).filter(dateStr => {
    const eventDate = new Date(dateStr);
    return eventDate >= today && eventDate <= nextWeek;
  }).reduce((acc, dateStr) => acc + events[dateStr as keyof typeof events].length, 0);

  const totalEventsCount = Object.values(events).reduce((acc, dayEvents) => acc + dayEvents.length, 0);

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
    </div>
  );
}
