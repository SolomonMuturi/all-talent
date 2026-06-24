'use client';

import { EventCreationForm } from '@/components/events/event-creation-form';

export default function CreateEventPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a new event.
        </p>
      </div>
      <EventCreationForm />
    </div>
  );
}