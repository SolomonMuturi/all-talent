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
import { Checkbox } from '../ui/checkbox';

type Person = { id: string; name: string; avatarUrl: string; team?: string };
type Status = 'Present' | 'Absent' | 'Late';

type AttendanceItem = {
  person: Person;
  status: Status;
  timestamp?: string;
};

const allPlayers = players.map(p => ({ id: `player-${p.id}`, name: p.name, avatarUrl: p.avatarUrl, team: p.team }));
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
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [playerFilter, setPlayerFilter] = useState('All');

  const updateAttendance = (
    list: AttendanceItem[],
    setList: React.Dispatch<React.SetStateAction<AttendanceItem[]>>,
    ids: string[],
    newStatus: Status
  ) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    let updatedPeople: Person[] = [];
    const updatedList = list.map(item => {
      if (ids.includes(item.person.id)) {
        updatedPeople.push(item.person);
        return { ...item, status: newStatus, timestamp };
      }
      return item;
    });
    setList(updatedList);
    
    if(newStatus === 'Present' || newStatus === 'Late') {
      const feedItems = updatedList.filter(item => ids.includes(item.person.id));
      setLiveFeed(prevFeed => [...feedItems, ...prevFeed].slice(0, 5));
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

  const notifyGuardian = (playerNames: string[]) => {
      toast({
          title: 'Notification Sent',
          description: `An SMS has been sent to the guardian(s) of ${playerNames.join(', ')}.`,
      })
  }
  
  const notifyAllAbsentees = (items: AttendanceItem[]) => {
      const absentPlayers = items.filter(item => item.status === 'Absent');
      if (absentPlayers.length > 0) {
        notifyGuardian(absentPlayers.map(p => p.person.name));
      } else {
        toast({
            variant: 'destructive',
            title: 'No Absentees',
            description: `There are no absent players to notify.`
        })
      }
  }
  
  const handleSelectedAction = (action: 'Present' | 'Absent' | 'Notify') => {
    const selectedItems = playerAttendance.filter(item => selectedPlayerIds.includes(item.person.id));
    if (action === 'Notify') {
        notifyGuardian(selectedItems.map(item => item.person.name));
    } else {
        updateAttendance(playerAttendance, setPlayerAttendance, selectedPlayerIds, action);
    }
    setSelectedPlayerIds([]);
  };

  const filteredPlayers = playerAttendance.filter(item => playerFilter === 'All' || item.person.team === playerFilter);

  const presentPlayers = playerAttendance.filter(p => p.status === 'Present' || p.status === 'Late').length;
  const absentPlayers = playerAttendance.length - presentPlayers;
  const presentStaff = staffAttendance.filter(p => p.status === 'Present' || p.status === 'Late').length;

  const AttendanceTable = ({ items, onUpdate, onBatchUpdate, title, isPlayerTable = false, onSelectionChange, selectedIds, onFilterChange, filterValue }: { items: AttendanceItem[], onUpdate: (id: string[], status: Status) => void, onBatchUpdate?: (status: Status | 'Reset') => void, title: string, isPlayerTable?: boolean, onSelectionChange?: (ids: string[]) => void, selectedIds?: string[], onFilterChange?: (value: string) => void, filterValue?: string }) => (
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
        {isPlayerTable && onFilterChange && (
            <div className='flex items-center gap-2 mt-4'>
                <label className="text-sm font-medium">Filter by Team:</label>
                <Select value={filterValue} onValueChange={onFilterChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Teams</SelectItem>
                        <SelectItem value="U-15">U-15</SelectItem>
                        <SelectItem value="U-17">U-17</SelectItem>
                        <SelectItem value="U-19">U-19</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        )}
      </CardHeader>
      <CardContent>
         <Table>
            <TableHeader>
                <TableRow>
                    {isPlayerTable && onSelectionChange && (
                        <TableHead className="w-[40px]">
                            <Checkbox 
                                checked={selectedIds?.length === items.length && items.length > 0}
                                onCheckedChange={(checked) => {
                                    onSelectionChange(checked ? items.map(i => i.person.id) : []);
                                }}
                            />
                        </TableHead>
                    )}
                <TableHead>Person</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                <TableRow key={item.person.id}>
                    {isPlayerTable && onSelectionChange && (
                        <TableCell>
                            <Checkbox 
                                checked={selectedIds?.includes(item.person.id)}
                                onCheckedChange={(checked) => {
                                    onSelectionChange(
                                        checked 
                                        ? [...(selectedIds || []), item.person.id] 
                                        : (selectedIds || []).filter(id => id !== item.person.id)
                                    )
                                }}
                            />
                        </TableCell>
                    )}
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
                            <Button variant="ghost" size="sm" onClick={() => notifyGuardian([item.person.name])}>
                                <Send className="mr-2 h-4 w-4" />
                                Notify
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">Set Status</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onUpdate([item.person.id], 'Present')}>Present</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdate([item.person.id], 'Late')}>Late</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdate([item.person.id], 'Absent')}>Absent</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
        {isPlayerTable && selectedIds && selectedIds.length > 0 && (
            <div className="mt-4 p-2 bg-muted/50 rounded-lg flex items-center justify-between">
                <p className="text-sm font-medium">{selectedIds.length} player(s) selected.</p>
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSelectedAction('Present')}>Mark as Present</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleSelectedAction('Absent')}>Mark as Absent</Button>
                    <Button size="sm" variant="outline" onClick={() => handleSelectedAction('Notify')}><Send className="mr-2 h-3 w-3" /> Notify Guardians</Button>
                </div>
            </div>
        )}
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
                            items={filteredPlayers} 
                            onUpdate={(ids, status) => updateAttendance(playerAttendance, setPlayerAttendance, ids, status)}
                            onBatchUpdate={(status) => handleBatchUpdate(setPlayerAttendance, status)}
                            title="Daily Player Attendance"
                            isPlayerTable={true}
                            selectedIds={selectedPlayerIds}
                            onSelectionChange={setSelectedPlayerIds}
                            filterValue={playerFilter}
                            onFilterChange={setPlayerFilter}
                        />
                    </TabsContent>
                    <TabsContent value="staff" className="mt-4">
                        <AttendanceTable 
                            items={staffAttendance} 
                            onUpdate={(ids, status) => updateAttendance(staffAttendance, setStaffAttendance, ids, status)} 
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
                                onUpdate={(ids, status) => updateAttendance(gameDayAttendance, setGameDayAttendance, ids, status)} 
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
