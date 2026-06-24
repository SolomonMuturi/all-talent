'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Landmark,
  MapPin,
  Footprints,
  Trophy,
  Users,
  Calendar,
  Ticket,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TeamFormation } from './team-formation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AcademyEvent {
  id: string;
  title: string;
  subtitle?: string;
  organizer: string;
  event_date: string | null;
  category: string;
  logo_url?: string;
  country?: string;
  location?: string;
  venue?: string;
  game_type?: string;
  tournament_type?: string;
  team_count?: number;
  lineup_formation?: string;
  lineup_squad?: any[];
  description?: string;
}

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
  const safeEvent = {
    ...event,
    subtitle: event.subtitle || '',
    event_date: event.event_date || null,
    logo_url: event.logo_url || '',
    country: event.country || 'Not specified',
    location: event.location || 'Not specified',
    venue: event.venue || 'Not specified',
    game_type: event.game_type || 'Not specified',
    tournament_type: event.tournament_type || 'N/A',
    team_count: event.team_count || 0,
    lineup_formation: event.lineup_formation || '',
    lineup_squad: Array.isArray(event.lineup_squad) ? event.lineup_squad : [],
    description: event.description || '',
  };

  const eventDetails = [
    {
      icon: <User className="h-5 w-5 text-foreground" />,
      label: 'Organizer',
      value: safeEvent.organizer,
    },
    {
      icon: <Footprints className="h-5 w-5 text-foreground" />,
      label: 'Game Type',
      value: safeEvent.game_type,
    },
    {
      icon: <MapPin className="h-5 w-5 text-foreground" />,
      label: 'Location',
      value: safeEvent.location,
    },
    {
      icon: <Trophy className="h-5 w-5 text-foreground" />,
      label: 'Tournament Type',
      value: safeEvent.tournament_type,
    },
    {
      icon: <Landmark className="h-5 w-5 text-foreground" />,
      label: 'Venue',
      value: safeEvent.venue,
    },
    {
      icon: <Users className="h-5 w-5 text-foreground" />,
      label: 'No. of Teams',
      value: safeEvent.team_count,
    },
  ];

  const formatEventDate = () => {
    if (!safeEvent.event_date) return 'Date not set';
    
    try {
      const date = new Date(safeEvent.event_date);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Date error';
    }
  };

  const getLineupSquad = () => {
    try {
      if (!safeEvent.lineup_squad || safeEvent.lineup_squad.length === 0) {
        return [];
      }
      
      if (typeof safeEvent.lineup_squad === 'string') {
        return JSON.parse(safeEvent.lineup_squad);
      }
      
      if (Array.isArray(safeEvent.lineup_squad)) {
        return safeEvent.lineup_squad;
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing lineup_squad:', error);
      return [];
    }
  };

  const lineupSquad = getLineupSquad();

  return (
    <Card>
      <CardHeader className="text-center">
        {safeEvent.logo_url && safeEvent.logo_url.trim() !== '' ? (
          <div className="flex justify-center mb-4">
            <div className="relative h-20 w-20">
              <Image
                src={safeEvent.logo_url}
                alt={`${safeEvent.title} logo`}
                width={80}
                height={80}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Logo</span>
            </div>
          </div>
        )}
        
        <CardTitle className="text-2xl font-bold tracking-tight font-headline">
          {safeEvent.title}
        </CardTitle>
        {safeEvent.subtitle && safeEvent.subtitle.trim() !== '' && (
          <CardDescription className="text-lg">
            {safeEvent.subtitle}
          </CardDescription>
        )}
        <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground mt-2">
          <div className='flex items-center gap-2'>
            <Calendar className="h-4 w-4" />
            <span>{formatEventDate()}</span>
          </div>
          <Badge variant="outline">{safeEvent.category}</Badge>
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
            
            {safeEvent.description && safeEvent.description.trim() !== '' && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Event Description</h3>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="whitespace-pre-line">{safeEvent.description}</p>
                </div>
              </div>
            )}
            
            {safeEvent.country && safeEvent.country !== 'Not specified' && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Country</h3>
                <p>{safeEvent.country}</p>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Button asChild>
                <Link href={`/ticketing?event=${safeEvent.id}`}>
                  <Ticket className="mr-2 h-4 w-4" />
                  Purchase Ticket
                </Link>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="lineup" className="mt-4">
            {lineupSquad.length > 0 ? (
              <TeamFormation 
                lineup={{
                  formation: safeEvent.lineup_formation || '4-4-2',
                  squad: lineupSquad
                }} 
              />
            ) : (
              <div className='text-center text-muted-foreground py-8'>
                Lineup information is not available for this event.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}