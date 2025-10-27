'use client';

import { useState } from 'react';
import { BarChart, QrCode, Ticket, DollarSign, Users, Loader2 } from 'lucide-react';
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
import { events } from '@/lib/data';
import { KpiCard } from '../dashboard/kpi-card';

const initialTiers = [
  { name: 'VIP', price: 2000, sold: 50, total: 100 },
  { name: 'Regular', price: 500, sold: 350, total: 1000 },
  { name: 'Student', price: 200, sold: 150, total: 200 },
];

export function TicketManagement() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [ticketTiers, setTicketTiers] = useState(initialTiers);
  const [isTierDialogOpen, setTierDialogOpen] = useState(false);

  const totalRevenue = ticketTiers.reduce((acc, tier) => acc + tier.price * tier.sold, 0);
  const totalTicketsSold = ticketTiers.reduce((acc, tier) => acc + tier.sold, 0);
  const totalCapacity = ticketTiers.reduce((acc, tier) => acc + tier.total, 0);
  const eventForBooking = events.find(e => e.title.includes("U-17"));

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

  const handleTierUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedTiers = ticketTiers.map(tier => {
      const newPrice = formData.get(`price-${tier.name}`);
      const newTotal = formData.get(`total-${tier.name}`);
      return {
        ...tier,
        price: newPrice ? Number(newPrice) : tier.price,
        total: newTotal ? Number(newTotal) : tier.total,
      };
    });
    setTicketTiers(updatedTiers);
    toast({
        title: "Ticket Tiers Updated",
        description: "Pricing and availability have been successfully updated."
    });
    setTierDialogOpen(false);
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
                    <CardTitle className="font-headline">U-17 Regional Finals</CardTitle>
                    <CardDescription>
                    Live ticket sales and revenue for the upcoming tournament.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-3">
                         <KpiCard
                            title="Total Revenue"
                            value={`KES ${totalRevenue.toLocaleString()}`}
                            icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
                            description={`from ${totalTicketsSold.toLocaleString()} tickets`}
                        />
                         <KpiCard
                            title="Tickets Sold"
                            value={`${totalTicketsSold.toLocaleString()} / ${totalCapacity.toLocaleString()}`}
                            icon={<Ticket className="h-5 w-5 text-muted-foreground" />}
                            description={`${totalCapacity > 0 ? ((totalTicketsSold / totalCapacity) * 100).toFixed(1) : 0}% of capacity`}
                        />
                        <KpiCard
                            title="Live Attendance"
                            value={`125 / ${totalTicketsSold}`}
                            icon={<Users className="h-5 w-5 text-muted-foreground" />}
                            description={`${totalTicketsSold > 0 ? ((125 / totalTicketsSold) * 100).toFixed(1) : 0}% of tickets scanned`}
                        />
                    </div>
                    <div className="mt-6">
                    <h3 className="text-md font-medium mb-4">Sales by Tier</h3>
                    <div className="space-y-4">
                        {ticketTiers.map((tier) => (
                        <div key={tier.name}>
                            <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{tier.name}</span>
                            <span>
                                {tier.sold} / {tier.total}
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
                        <TableRow>
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
                <Link href="/ticketing/ticket/TKT-8A3F4E" passHref>
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
                                <div className="space-y-4 py-4">
                                    {ticketTiers.map(tier => (
                                        <div key={tier.name} className="grid grid-cols-3 items-center gap-4 p-2 border rounded-lg">
                                            <Label htmlFor={`price-${tier.name}`} className="font-semibold">{tier.name}</Label>
                                            <div className='col-span-2 grid grid-cols-2 gap-2'>
                                            <div>
                                                <Label htmlFor={`price-${tier.name}`} className="text-xs text-muted-foreground">Price (KES)</Label>
                                                <Input name={`price-${tier.name}`} id={`price-${tier.name}`} type="number" defaultValue={tier.price} />
                                            </div>
                                            <div>
                                                <Label htmlFor={`total-${tier.name}`} className="text-xs text-muted-foreground">Total</Label>
                                                <Input name={`total-${tier.name}`} id={`total-${tier.name}`} type="number" defaultValue={tier.total} />
                                            </div>
                                            </div>
                                        </div>
                                    ))}
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

// Separator Component for use in the card
function Separator() {
  return <div className="border-t border-dashed my-2"></div>;
}
