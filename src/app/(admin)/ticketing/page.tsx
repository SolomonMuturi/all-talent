'use client';

import { useState, useEffect } from 'react';
import { TicketManagement } from '@/components/ticketing/ticket-management';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';

interface Analytics {
  totalParticipants: number;
  upcomingEvents: number;
  statusSummary: Array<{
    status: string;
    count: number;
  }>;
}

export default function TicketingPage() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalParticipants: 0,
    upcomingEvents: 0,
    statusSummary: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/ticketing/analytics');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalytics(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch ticketing analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmedTickets = analytics.statusSummary.find(s => s.status === 'Confirmed')?.count || 0;
  const pendingTickets = analytics.statusSummary.find(s => s.status === 'Pending')?.count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Tournament Ticket Management</h1>
        <p className="text-muted-foreground">
          Manage ticket sales, pricing, and revenue for your events.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Total Participants"
          value={String(analytics.totalParticipants)}
          icon={<Users className="size-5 text-muted-foreground" />}
          description="Across all events"
        />
        <KpiCard
          title="Upcoming Events"
          value={String(analytics.upcomingEvents)}
          icon={<Calendar className="size-5 text-muted-foreground" />}
          description="Scheduled events"
        />
        <KpiCard
          title="Confirmed Tickets"
          value={String(confirmedTickets)}
          icon={<CheckCircle className="size-5 text-muted-foreground" />}
          description="Verified participants"
        />
        <KpiCard
          title="Pending Tickets"
          value={String(pendingTickets)}
          icon={<Clock className="size-5 text-muted-foreground" />}
          description="Awaiting confirmation"
        />
      </div>

      <TicketManagement />
    </div>
  );
}
