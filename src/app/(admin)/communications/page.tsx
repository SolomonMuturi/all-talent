import { CommunicationsHub } from "@/components/communications/communications-hub";

export default function CommunicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Communications Hub</h1>
        <p className="text-muted-foreground">
          Manage messages, reminders, and alerts across all channels.
        </p>
      </div>
      <CommunicationsHub />
    </div>
  );
}
