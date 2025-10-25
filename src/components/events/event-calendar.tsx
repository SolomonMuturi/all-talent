'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users } from 'lucide-react';
import { players, events } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Checkbox } from '../ui/checkbox';
import { isSameDay, format } from 'date-fns';

export function EventCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDayEvents = date
    ? events.filter(event => isSameDay(event.date, date!))
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="p-0"
              classNames={{
                root: 'w-full',
                months: 'w-full',
                month: 'w-full',
                table: 'w-full border-separate border-spacing-0',
                head_row: 'flex',
                head_cell: 'w-full text-muted-foreground rounded-md font-normal text-[0.8rem] justify-center',
                row: 'flex w-full mt-2',
                cell: 'w-full h-16 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
                day: 'h-16 w-full p-1 font-normal aria-selected:opacity-100 flex flex-col items-start justify-start',
                day_selected:
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                day_today: 'bg-accent text-accent-foreground',
                day_outside: 'text-muted-foreground opacity-50',
              }}
              components={{
                DayContent: ({ date }) => {
                  const dayEvents = events.filter(event => isSameDay(event.date, date));
                  return (
                    <>
                    <span className="self-center">{date.getDate()}</span>
                    <div className="mt-1 flex flex-col items-start w-full">
                    {dayEvents.map((event) => (
                        <Badge key={event.id} variant="secondary" className="text-xs w-full truncate text-left mb-1">
                          {event.title}
                        </Badge>
                      ))}
                    </div>
                    </>
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              {date ? format(date, 'PPP') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {selectedDayEvents.length} event(s) scheduled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((event, index) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{format(event.date, 'p')}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No events for this day.</p>
            )}
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </CardContent>
        </Card>
        
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Users className="size-5" /> Roster Management
                </CardTitle>
                <CardDescription>Assign players to 'U-17 Training'.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="max-h-60 overflow-y-auto pr-2">
                    {players.filter(p => p.team === 'U-17').map(player => (
                        <div key={player.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={player.avatarUrl} alt={player.name} />
                                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium flex-1">{player.name}</span>
                            <Checkbox />
                        </div>
                    ))}
                </div>
                 <Button className="w-full mt-4">Update Roster</Button>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}

// Dummy DayContent for types
const DayContent = (props: any) => <div>{props.date.getDate()}</div>;
