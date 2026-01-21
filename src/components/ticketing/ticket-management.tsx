'use client';

import { useState, useEffect } from 'react';
import { BarChart, QrCode, Ticket, DollarSign, Users, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { TicketBookingForm } from './ticket-booking-form';
import { KpiCard } from '../dashboard/kpi-card';
import { safeFormatDate } from '@/lib/date-utils';

interface TicketItem {
  id: string;
  event_id: string;
  player_id: number;
  player_name: string;
  event_title: string;
  event_date: string;
  ticket_status: string;
  participation_type: string;
  ticket_number: string;
  ticket_date: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  logo_url?: string;
}

// Separator Component for use in the card
function Separator() {
  return <div className="border-t border-dashed my-2"></div>;
}

export function TicketManagement() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTierDialogOpen, setTierDialogOpen] = useState(false);
  const [editableTiers, setEditableTiers] = useState([
    { name: 'VIP', price: 5000, total: 100, sold: 85 },
    { name: 'Regular', price: 2500, total: 500, sold: 420 },
    { name: 'Student', price: 1500, total: 200, sold: 150 },
  ]);
  
  useEffect(() => {
    fetchTickets();
    fetchEvents();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/ticketing/tickets');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Ensure all tickets have proper event_date
          const ticketsWithDates = data.data.tickets.map((ticket: any) => ({
            ...ticket,
            event_date: ticket.event_date || new Date().toISOString(), // Fallback date
          }));
          setTickets(ticketsWithDates);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?limit=100');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvents(data.data.events);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    }
  };

  const confirmedTickets = tickets.filter(t => t.ticket_status === 'Confirmed').length;
  const pendingTickets = tickets.filter(t => t.ticket_status === 'Pending').length;
  const totalTickets = tickets.length;
  const eventForBooking = events[0];

  // Calculate total revenue from all confirmed tickets (use ticket.total_amount if available)
  const totalRevenue = tickets
    .filter(t => t.ticket_status === 'Confirmed')
    .reduce((acc, t) => acc + (typeof t.total_amount === 'number' ? t.total_amount : 0), 0);

  const handleGenerateAndSend = () => {
    setIsGenerating(true);
    setTimeout(() => {
      toast({
        title: "Tickets Sent!",
        description: "All purchased e-tickets have been generated and sent to the buyers.",
      });
      setIsGenerating(false);
    }, 2000);
  };

  const handleEditableTierChange = (index: number, field: string, value: string) => {
    const updatedTiers = [...editableTiers];
    if (field === 'price' || field === 'total') {
      updatedTiers[index][field] = Number(value);
    } else {
      updatedTiers[index][field] = value;
    }
    setEditableTiers(updatedTiers);
  };

  const handleAddNewTier = () => {
    setEditableTiers([...editableTiers, { name: 'New Tier', price: 0, total: 0, sold: 0 }]);
  };

  const handleRemoveTier = (index: number) => {
    if (editableTiers.length > 1) {
      const updatedTiers = editableTiers.filter((_, i) => i !== index);
      setEditableTiers(updatedTiers);
    }
  };

  const handleTierUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle tier update logic here
    setTierDialogOpen(false);
    toast({
      title: "Tiers Updated",
      description: "Ticket tiers have been updated successfully.",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin" />
            <span className="ml-2">Loading tickets...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="dashboard">
      <TabsList className="mb-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="book">Book Ticket</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{eventForBooking?.title || 'Event Ticketing'}</CardTitle>
                <CardDescription>
                  Live ticket sales and revenue for upcoming events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3">
                  <KpiCard
                    title="Total Tickets"
                    value={String(totalTickets)}
                    icon={<Ticket className="h-5 w-5 text-muted-foreground" />}
                    description={`${confirmedTickets} confirmed, ${pendingTickets} pending`}
                  />
                  <KpiCard
                    title="Confirmed Tickets"
                    value={String(confirmedTickets)}
                    icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                    description="Verified participants"
                  />
                  <KpiCard
                    title="Total Revenue"
                    value={`KES ${totalRevenue > 0 ? totalRevenue.toLocaleString() : '-'}`}
                    icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                    description="From confirmed tickets"
                  />
                </div>
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-4">Recent Tickets</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket #</TableHead>
                          <TableHead>Participant</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tickets.slice(0, 10).map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-mono text-sm">{ticket.ticket_number}</TableCell>
                            <TableCell>{ticket.player_name}</TableCell>
                            <TableCell>{ticket.event_title}</TableCell>
                            <TableCell>
                              {safeFormatDate(ticket.event_date)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={ticket.ticket_status === 'Confirmed' ? 'default' : 'secondary'}>
                                {ticket.ticket_status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-4">Ticket Tiers</h3>
                  <div className="space-y-4">
                    {editableTiers.map((tier, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{tier.name}</span>
                          <span className="text-muted-foreground">
                            KES {tier.price.toLocaleString()} - {tier.sold}/{tier.total} sold
                          </span>
                        </div>
                        <Progress value={tier.total > 0 ? (tier.sold / tier.total) * 100 : 0} />
                        {tier.sold >= tier.total && <p className='text-xs text-destructive font-medium mt-1'>Sold Out!</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">
                  Real-time Gate Revenue
                </CardTitle>
                <CardDescription>
                  Live feed of ticket validation at the gate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">TKT-8A3F4E</TableCell>
                      <TableCell>VIP</TableCell>
                      <TableCell>
                        <Badge>Validated</Badge>
                      </TableCell>
                      <TableCell className="text-right">13:05:12</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">TKT-9B1C2D</TableCell>
                      <TableCell>Regular</TableCell>
                      <TableCell>
                        <Badge>Validated</Badge>
                      </TableCell>
                      <TableCell className="text-right">13:05:08</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">TKT-7G5H6I</TableCell>
                      <TableCell>Regular</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Duplicate</Badge>
                      </TableCell>
                      <TableCell className="text-right">13:04:55</TableCell>
                    </TableRow>
                    <TableCell className="font-mono">TKT-4E2F1G</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>
                      <Badge>Validated</Badge>
                    </TableCell>
                    <TableCell className="text-right">13:04:49</TableCell>
                  </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">E-Ticket Preview</CardTitle>
                <CardDescription>Example of a generated e-ticket.</CardDescription>
              </CardHeader>
              <Link href="/ticketing/ticket/TKT-8A3F4E">
                <CardContent className="flex flex-col items-center text-center p-4 cursor-pointer hover:bg-muted/50 rounded-b-lg">
                  <div className="border rounded-lg p-6 bg-card w-full max-w-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">U-17 Regional Finals</h3>
                      <Ticket className="h-6 w-6 text-primary" />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 my-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tier</p>
                        <p className="font-semibold">VIP</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Gate</p>
                        <p className="font-semibold">3A</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-semibold">28 July 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Time</p>
                        <p className="font-semibold">14:00 KST</p>
                      </div>
                    </div>
                    <div className="flex justify-center my-4">
                      <Image
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TKT-8A3F4E"
                        width={120}
                        height={120}
                        alt="QR Code"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">TKT-8A3F4E</p>
                  </div>
                </CardContent>
              </Link>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full" onClick={handleGenerateAndSend} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                  {isGenerating ? 'Sending Tickets...' : 'Generate & Send Tickets'}
                </Button>
                <Dialog open={isTierDialogOpen} onOpenChange={setTierDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full">
                      Manage Ticket Tiers
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleTierUpdate}>
                      <DialogHeader>
                        <DialogTitle>Manage Ticket Tiers</DialogTitle>
                        <DialogDescription>
                          Adjust pricing and availability for each ticket tier.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                        {editableTiers.map((tier, index) => (
                          <div key={index} className="grid grid-cols-12 items-center gap-2 p-2 border rounded-lg">
                            <div className="col-span-4">
                              <Label htmlFor={`name-${index}`} className="text-xs text-muted-foreground">Tier Name</Label>
                              <Input 
                                id={`name-${index}`}
                                value={tier.name}
                                placeholder="e.g. Early Bird"
                                onChange={(e) => handleEditableTierChange(index, 'name', e.target.value)}
                              />
                            </div>
                            <div className='col-span-3'>
                              <Label htmlFor={`price-${index}`} className="text-xs text-muted-foreground">Price (KES)</Label>
                              <Input 
                                id={`price-${index}`} 
                                type="number" 
                                value={tier.price}
                                onChange={(e) => handleEditableTierChange(index, 'price', e.target.value)}
                              />
                            </div>
                            <div className='col-span-3'>
                              <Label htmlFor={`total-${index}`} className="text-xs text-muted-foreground">Total</Label>
                              <Input 
                                id={`total-${index}`} 
                                type="number" 
                                value={tier.total}
                                onChange={(e) => handleEditableTierChange(index, 'total', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2 flex items-end h-full">
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveTier(index)} type="button">
                                <Trash2 className="h-4 w-4 text-destructive"/>
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" type="button" onClick={handleAddNewTier} className="w-full">
                          <PlusCircle className="mr-2 h-4 w-4"/>
                          Add Tier
                        </Button>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="book">
        {eventForBooking ? <TicketBookingForm event={eventForBooking} /> : <p>No event available for booking.</p>}
      </TabsContent>
    </Tabs>
  );
}