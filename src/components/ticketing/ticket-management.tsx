'use client';

import { BarChart, QrCode, Ticket, DollarSign, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

const ticketTiers = [
  { name: 'VIP', price: 2000, sold: 50, total: 100 },
  { name: 'Regular', price: 500, sold: 350, total: 1000 },
  { name: 'Student', price: 200, sold: 150, total: 200 },
];

const totalRevenue = ticketTiers.reduce(
  (acc, tier) => acc + tier.price * tier.sold,
  0
);
const totalTicketsSold = ticketTiers.reduce((acc, tier) => acc + tier.sold, 0);
const totalCapacity = ticketTiers.reduce((acc, tier) => acc + tier.total, 0);

export function TicketManagement() {
  return (
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    KES {totalRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    from {totalTicketsSold.toLocaleString()} tickets sold
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tickets Sold
                  </CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalTicketsSold.toLocaleString()} /{' '}
                    {totalCapacity.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((totalTicketsSold / totalCapacity) * 100).toFixed(1)}% of
                    capacity
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Live Attendance
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">125 / 550</div>
                  <p className="text-xs text-muted-foreground">
                    22.7% of tickets scanned
                  </p>
                </CardContent>
              </Card>
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
                    <Progress value={(tier.sold / tier.total) * 100} />
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
          <CardContent className="flex flex-col items-center text-center p-4">
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
          <CardFooter className="flex-col gap-2">
             <Button className="w-full">
              <QrCode className="mr-2 h-4 w-4" />
              Generate & Send Tickets
            </Button>
            <Button variant="secondary" className="w-full">
              Manage Ticket Tiers
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Separator Component for use in the card
function Separator() {
  return <div className="border-t border-dashed my-2"></div>;
}
