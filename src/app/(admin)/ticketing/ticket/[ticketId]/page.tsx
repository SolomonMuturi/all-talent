import { TicketTemplate } from "@/components/ticketing/ticket-template";
import { notFound } from "next/navigation";

export default function TicketPage({ params }: { params: { ticketId: string } }) {
    if (!params.ticketId) {
        notFound();
    }
    
    // In a real app, you would fetch ticket details based on the ticketId
    const ticketDetails = {
        id: decodeURIComponent(params.ticketId),
        event: 'U-17 Regional Finals',
        tier: 'VIP',
        gate: '3A',
        date: '28 July 2024',
        time: '14:00 KST',
    };

    return <TicketTemplate {...ticketDetails} />;
}
