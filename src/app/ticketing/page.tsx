import { TicketManagement } from '@/components/ticketing/ticket-management';

export default function TicketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Tournament Ticket Management</h1>
        <p className="text-muted-foreground">
          Manage ticket sales, pricing, and revenue for your events.
        </p>
      </div>
      <TicketManagement />
    </div>
  );
}
