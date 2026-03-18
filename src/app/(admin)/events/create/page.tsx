import { EventCreationForm } from "@/components/events/event-creation-form";

export default function CreateEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Create a New Event</h1>
        <p className="text-muted-foreground">
          Fill out the form below to list your event on the platform.
        </p>
      </div>
      <EventCreationForm />
    </div>
  );
}
