'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Globe,
  MapPin,
  Stadium,
  Footprints,
  Trophy,
  Users,
  Calendar,
  Ticket,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AcademyEvent } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TeamFormation } from './team-formation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface EventDetailsProps {
  event: AcademyEvent;
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center justify-between rounded-lg border bg-background p-3 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
    </div>
    <span className="text-sm font-semibold">{value}</span>
  </div>
);

export function EventDetails({ event }: EventDetailsProps) {
  const { details } = event;

  const eventDetails = [
    {
      icon: <Globe className="h-5 w-5 text-foreground" />,
      label: 'Country',
      value: details.country,
    },
    {
      icon: <Footprints className="h-5 w-5 text-foreground" />,
      label: 'Game Type',
      value: details.gameType,
    },
    {
      icon: <MapPin className="h-5 w-5 text-foreground" />,
      label: 'Location',
      value: details.location,
    },
    {
      icon: <Trophy className="h-5 w-5 text-foreground" />,
      label: 'Tournament Type',
      value: details.tournamentType,
    },
    {
      icon: <Stadium className="h-5 w-5 text-foreground" />,
      label: 'Venue',
      value: details.venue,
    },
    {
      icon: <Users className="h-5 w-5 text-foreground" />,
      label: 'No. of Teams',
      value: details.teamCount,
    },
  ];

  return (
    <Card>
      <CardHeader className="text-center">
        {event.logoUrl && (
          <div className="flex justify-center mb-4">
            <div className="relative h-20 w-20">
              <Image
                src={event.logoUrl}
                alt={`${event.title} logo`}
                layout="fill"
                objectFit="contain"
              />
            </div>
          </div>
        )}
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          {event.title} - {event.subtitle}
        </h2>
        <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {event.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <Badge variant="outline">{event.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="lineup">Starting Lineup</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventDetails.map((item) => (
                <DetailItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
             <div className="mt-6 text-center">
                <Button asChild>
                    <Link href="/ticketing">
                        <Ticket className="mr-2 h-4 w-4" />
                        Book Tickets Now
                    </Link>
                </Button>
            </div>
          </TabsContent>
          <TabsContent value="lineup" className="mt-4">
            <TeamFormation lineup={details.lineup} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
