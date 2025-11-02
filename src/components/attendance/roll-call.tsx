'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { players, teamMembers, events } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Users, Clock, CheckCheck, RefreshCcw, CalendarCheck, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

type Person = { id: string; name: string; avatarUrl: string };
type Status = 'Present' | 'Absent' | 'Late';

type AttendanceItem = {
  person: Person;
  status: Status;
  timestamp?: string;
};

const allPlayers = players.map(p => ({ id: `player-${p.id}`, name: p.name, avatarUrl: p.avatarUrl }));
const allStaff = teamMembers.map(m => ({ id: `staff-${m.id}`, name: m.name, avatarUrl: m.avatarUrl }));

const initialAttendance = (people: Person[]): AttendanceItem[] => {
  return people.map(p => ({ person: p, status: 'Absent' }));
};

const getStatusVariant = (status: Status): 'default' | 'destructive' | 'secondary' => {
  switch (status) {
    case 'Present': return 'default';
    case 'Absent': return 'destructive';
    case 'Late': return 'secondary';
  }
};

export function RollCall() {
  const { toast } = useToast();
  const [playerAttendance, setPlayerAttendance] = useState<AttendanceItem[]>(initialAttendance(allPlayers));
  const [staffAttendance, setStaffAttendance] = useState<AttendanceItem[]>(initialAttendance(allStaff));
  const [gameDayAttendance, setGameDayAttendance] = useState<AttendanceItem[]>([]);
  const [liveFeed, setLiveFeed] = useState<AttendanceItem[]>([]);

  const updateAttendance = (
    list: AttendanceItem[],
    setList: React.Dispatch<React.SetStateAction<AttendanceItem[]>>,
    id: string,
    newStatus: Status
  ) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updatedList = list.map(item =>
      item.person.id === id ? { ...item, status: newStatus, timestamp } : item
    );
    setList(updatedList);
    
    if(newStatus === 'Present' || newStatus === 'Late') {
      const person = updatedList.find(item => item.person.id === id);
      if(person) {
        setLiveFeed(prevFeed => [person, ...prevFeed].slice(0, 5));
      }
    }
  };

  const handleBatchUpdate = (
    setList: React.Dispatch<React.SetStateAction<AttendanceItem[]>>,
    status: Status | 'Reset'
  ) => {
    setList(prevList => prevList.map(item => ({...item, status: status === 'Reset' ? 'Absent' : status})));
  }

  const handleGameDaySelect = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event && event.details.lineup) {
        const gameDayPlayers = event.details.lineup.squad.map(squadMember => {
            const player = players.find(p => p.name === squadMember.name);
            return { id: `player-${player?.id}`, name: squadMember.name, avatarUrl: player?.avatarUrl || '' };
        });
        setGameDayAttendance(initialAttendance(gameDayPlayers));
    } else {
        setGameDayAttendance([]);
    }
  }

  const notifyGuardian = (playerName: string) => {
      toast({
          title: 'Notification Sent',
          description: `An SMS has been sent to the guardian of ${playerName}.`
      })
  }
  
  const notifyAllAbsentees = (items: AttendanceItem[]) => {
      const absentPlayers = items.filter(item => item.status === 'Absent').length;
      if (absentPlayers > 0) {
        toast({
            title: 'Batch Notifications Sent',
            description: `Sent ${absentPlayers} notification(s) to guardians of all absent players.`
        })
      } else {
        toast({
            variant: 'destructive',
            title: 'No Absentees',
            description: `There are no absent players to notify.`
        })
      }
  }

  const presentPlayers = playerAttendance.filter(p => p.status === 'Present' || p.status === 'Late').length;
  const absentPlayers = playerAttendance.length - presentPlayers;
  const presentStaff = staffAttendance.filter(p => p.status === 'Present' || p.status === 'Late').length;

  const AttendanceTable = ({ items, onUpdate, onBatchUpdate, title, isPlayerTable = false }: { items: AttendanceItem[], onUpdate: (id: string, status: Status) => void, onBatchUpdate?: (status: Status | 'Reset') => void, title: string, isPlayerTable?: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2 justify-between items-center">
            <CardTitle>{title}</CardTitle>
            <div className="flex gap-2 flex-wrap">
                {isPlayerTable && <Button variant="outline" size="sm" onClick={() => notifyAllAbsentees(items)}><Send className="mr-2 h-4 w-4"/> Notify All Absentees</Button>}
                {onBatchUpdate && (
                    <>
                        <Button variant="outline" size="sm" onClick={() => onBatchUpdate('Present')}><CheckCheck className="mr-2 h-4 w-4"/> Mark All Present</Button>
                        <Button variant="ghost" size="sm" onClick={() => onBatchUpdate('Reset')}><RefreshCcw className="mr-2 h-4 w-4"/> Reset</Button>
                    </>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
         <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                <TableRow key={item.person.id}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={item.person.avatarUrl} alt={item.person.name} />
                        <AvatarFallback>{item.person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{item.person.name}</span>
                    </div>
                    </TableCell>
                    <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                         {isPlayerTable && item.status === 'Absent' && (
                            <Button variant="ghost" size="sm" onClick={() => notifyGuardian(item.person.name)}>
                                <Send className="mr-2 h-4 w-4" />
                                Notify
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Set Status</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onUpdate(item.person.id, 'Present')}>Present</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdate(item.person.id, 'Late')}>Late</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdate(item.person.id, 'Absent')}>Absent</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <Link href="/players">
                <KpiCard
                    title="Present Players"
                    value={`${presentPlayers} / ${playerAttendance.length}`}
                    icon={<UserCheck className="size-5 text-muted-foreground" />}
                    description="Players checked in for training"
                />
            </Link>
             <Link href="/players">
                <KpiCard
                    title="Absent Players"
                    value={String(absentPlayers)}
                    icon={<UserX className="size-5 text-muted-foreground" />}
                    description="Players not yet checked in"
                />
            </Link>
             <Link href="/team">
                <KpiCard
                    title="Present Staff"
                    value={`${presentStaff} / ${staffAttendance.length}`}
                    icon={<Users className="size-5 text-muted-foreground" />}
                    description="Staff members checked in"
                />
            </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Tabs defaultValue="players" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="players">Daily: Players</TabsTrigger>
                        <TabsTrigger value="staff">Daily: Staff</TabsTrigger>
                        <TabsTrigger value="gameday"><CalendarCheck className="mr-2 h-4 w-4"/>Game Day</TabsTrigger>
                    </TabsList>
                    <TabsContent value="players" className="mt-4">
                        <AttendanceTable 
                            items={playerAttendance} 
                            onUpdate={(id, status) => updateAttendance(playerAttendance, setPlayerAttendance, id, status)}
                            onBatchUpdate={(status) => handleBatchUpdate(setPlayerAttendance, status)}
                            title="Daily Player Attendance"
                            isPlayerTable={true}
                        />
                    </TabsContent>
                    <TabsContent value="staff" className="mt-4">
                        <AttendanceTable 
                            items={staffAttendance} 
                            onUpdate={(id, status) => updateAttendance(staffAttendance, setStaffAttendance, id, status)} 
                            onBatchUpdate={(status) => handleBatchUpdate(setStaffAttendance, status)}
                            title="Daily Staff Attendance"
                        />
                    </TabsContent>
                    <TabsContent value="gameday" className="mt-4 space-y-4">
                         <div className="flex items-center gap-4">
                            <label className="text-sm font-medium">Select Event</label>
                             <Select onValueChange={handleGameDaySelect}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Select a game..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {events.filter(e => e.details.lineup).map(event => (
                                        <SelectItem key={event.id} value={event.id}>{event.title} - {event.subtitle}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {gameDayAttendance.length > 0 ? (
                             <AttendanceTable 
                                items={gameDayAttendance} 
                                onUpdate={(id, status) => updateAttendance(gameDayAttendance, setGameDayAttendance, id, status)} 
                                onBatchUpdate={(status) => handleBatchUpdate(setGameDayAttendance, status)}
                                title="Game Day Roster"
                                isPlayerTable={true}
                            />
                        ) : (
                            <div className="text-center text-muted-foreground p-8 border rounded-lg bg-muted/20">
                                <p>Select an event to load the game day roster.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Clock className="size-5"/>
                            Live Feed
                        </CardTitle>
                        <CardDescription>Real-time check-in updates.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {liveFeed.length > 0 ? (
                            liveFeed.map((item, index) => (
                                <div key={`${item.person.id}-${index}`} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={item.person.avatarUrl} alt={item.person.name} />
                                            <AvatarFallback>{item.person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{item.person.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Checked in as <span className="font-semibold" style={{color: getStatusVariant(item.status) === 'default' ? 'hsl(var(--primary))' : 'hsl(var(--secondary-foreground))' }}>{item.status}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No check-ins yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
