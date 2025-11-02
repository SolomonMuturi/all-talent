'use client';

import { useState } from 'react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { players, teamMembers } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, UserX, Users, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type Person = { id: string; name: string; avatarUrl: string };
type Status = 'Present' | 'Absent' | 'Late';

type AttendanceItem = {
  person: Person;
  status: Status;
};

const allPersonnel = [
  ...players.map(p => ({ id: `player-${p.id}`, name: p.name, avatarUrl: p.avatarUrl })),
  ...teamMembers.map(m => ({ id: `staff-${m.id}`, name: m.name, avatarUrl: m.avatarUrl })),
];

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
  const [playerAttendance, setPlayerAttendance] = useState<AttendanceItem[]>(initialAttendance(players.map(p => ({ id: `player-${p.id}`, name: p.name, avatarUrl: p.avatarUrl }))));
  const [staffAttendance, setStaffAttendance] = useState<AttendanceItem[]>(initialAttendance(teamMembers.map(m => ({ id: `staff-${m.id}`, name: m.name, avatarUrl: m.avatarUrl }))));
  const [liveFeed, setLiveFeed] = useState<AttendanceItem[]>([]);

  const updateAttendance = (
    list: AttendanceItem[],
    setList: React.Dispatch<React.SetStateAction<AttendanceItem[]>>,
    id: string,
    newStatus: Status
  ) => {
    const updatedList = list.map(item =>
      item.person.id === id ? { ...item, status: newStatus } : item
    );
    setList(updatedList);
    
    if(newStatus === 'Present' || newStatus === 'Late') {
      const person = updatedList.find(item => item.person.id === id);
      if(person) {
        setLiveFeed(prevFeed => [person, ...prevFeed].slice(0, 5));
      }
    }
  };
  
  const presentPlayers = playerAttendance.filter(p => p.status === 'Present' || p.status === 'Late').length;
  const absentPlayers = playerAttendance.length - presentPlayers;
  const presentStaff = staffAttendance.filter(p => p.status === 'Present' || p.status === 'Late').length;


  const AttendanceTable = ({ items, onUpdate }: { items: AttendanceItem[], onUpdate: (id: string, status: Status) => void }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Person</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
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
            <TableCell className="text-right">
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
  );

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            <KpiCard
                title="Present Players"
                value={`${presentPlayers} / ${playerAttendance.length}`}
                icon={<UserCheck className="size-5 text-muted-foreground" />}
                description="Players checked in"
            />
            <KpiCard
                title="Absent Players"
                value={String(absentPlayers)}
                icon={<UserX className="size-5 text-muted-foreground" />}
                description="Players not yet checked in"
            />
            <KpiCard
                title="Present Staff"
                value={`${presentStaff} / ${staffAttendance.length}`}
                icon={<Users className="size-5 text-muted-foreground" />}
                description="Staff members checked in"
            />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Sheet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="players">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="players">Players</TabsTrigger>
                                <TabsTrigger value="staff">Staff</TabsTrigger>
                            </TabsList>
                            <TabsContent value="players" className="mt-4">
                                <AttendanceTable items={playerAttendance} onUpdate={(id, status) => updateAttendance(playerAttendance, setPlayerAttendance, id, status)} />
                            </TabsContent>
                            <TabsContent value="staff" className="mt-4">
                                <AttendanceTable items={staffAttendance} onUpdate={(id, status) => updateAttendance(staffAttendance, setStaffAttendance, id, status)} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
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
                                <div key={`${item.person.id}-${index}`} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={item.person.avatarUrl} alt={item.person.name} />
                                        <AvatarFallback>{item.person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{item.person.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Checked in as <span className="font-semibold" style={{color: getStatusVariant(item.status) === 'default' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}>{item.status}</span>
                                        </p>
                                    </div>
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
