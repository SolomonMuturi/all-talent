import { TicketBookingForm } from "@/components/ticketing/ticket-booking-form";

export default function BookTicketPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Book Your Ticket</h1>
        <p className="text-muted-foreground">
          Secure your spot for the U-17 Regional Finals.
        </p>
      </div>
      <TicketBookingForm />
    </div>
  );
}
