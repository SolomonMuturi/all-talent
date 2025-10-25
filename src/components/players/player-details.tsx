'use client';

import Image from 'next/image';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Scan, Fingerprint, Footprints, Gauge, Dumbbell, UserSquare, UserCheck, ShieldX, PlusCircle } from 'lucide-react';

import type { Player } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const metricIcons = {
  speed: <Footprints className="h-5 w-5 text-accent" />,
  stamina: <Gauge className="h-5 w-5 text-accent" />,
  shooting: <Dumbbell className="h-5 w-5 text-accent" />,
  passing: <Dumbbell className="h-5 w-5 text-accent" />,
};

const severityVariant = {
  Low: 'secondary',
  Medium: 'default',
  High: 'destructive',
} as const;

export function PlayerDetails({ player }: { player: Player }) {
  const performanceData = Object.entries(player.performanceMetrics).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg flex items-center gap-2">
              <UserSquare className="text-primary"/>
              Digital ID Card
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={player.avatarUrl} alt={player.name} />
              <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold font-headline">{player.name}</h2>
            <p className="text-muted-foreground">{player.position}</p>
            <p className="text-sm text-primary font-semibold">UPID: TT-{String(player.id).padStart(4, '0')}</p>
            <Separator className="my-4" />
            <div className="flex justify-center mb-4">
               <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=UPID:TT-${String(player.id).padStart(4, '0')}`}
                  width={100}
                  height={100}
                  alt="Player QR Code"
                />
            </div>
            <div className="grid grid-cols-2 gap-2 w-full text-sm">
                <div className="text-left text-muted-foreground">Team:</div>
                <div className="text-right font-medium">{player.team}</div>
                <div className="text-left text-muted-foreground">Attendance:</div>
                <div className="text-right font-medium">{player.attendance}%</div>
                <div className="text-left text-muted-foreground">Card Expires:</div>
                <div className="text-right font-medium">2025-01-01</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Tabs defaultValue="performance">
          <TabsList className="mb-4 grid w-full grid-cols-5">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="biometrics">Biometrics</TabsTrigger>
            <TabsTrigger value="gps">GPS Data</TabsTrigger>
            <TabsTrigger value="reports">Scouting</TabsTrigger>
            <TabsTrigger value="discipline">Discipline</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Performance Metrics</CardTitle>
                    <CardDescription>Key physical and technical attributes.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {Object.entries(player.performanceMetrics).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center gap-2">
                                {metricIcons[key as keyof typeof metricIcons]}
                                <h4 className="capitalize font-medium">{key}</h4>
                                <span className="ml-auto text-lg font-bold">{value}</span>
                            </div>
                            <Progress value={value} aria-label={`${key} score`} />
                        </div>
                    ))}
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="biometrics">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                        <UserCheck className="text-primary" />
                        Biometric Attendance
                    </CardTitle>
                    <CardDescription>Clock-In/Out via fingerprint/facial recognition for attendance verification.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 text-center">
                    <div className="flex gap-8">
                        <div className="flex flex-col items-center gap-2">
                            <Fingerprint className="w-20 h-20 text-primary" />
                            <p className="text-sm font-medium">Fingerprint</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Scan className="w-20 h-20 text-primary" />
                            <p className="text-sm font-medium">Facial Scan</p>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">Last clock-in: 8:02 AM, Main Training Facility</p>
                    <Button className="w-full max-w-xs mt-2">
                        <Scan className="mr-2 h-4 w-4" />
                        Initiate Manual Clock-In/Out
                    </Button>
                    <p className="text-xs text-muted-foreground">Manual clock-in requires admin approval.</p>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gps">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">GPS Heatmap</CardTitle>
                <CardDescription>Player movement analysis from last match.</CardDescription>
              </CardHeader>
              <CardContent>
                <Image 
                    src="https://picsum.photos/seed/heatmap1/600/400" 
                    alt="GPS Heatmap"
                    width={600}
                    height={400}
                    className="rounded-lg object-cover w-full"
                    data-ai-hint="football pitch heatmap"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Latest Scouting Report</CardTitle>
                    <CardDescription>From: Peter Kamau, Date: 2024-07-10</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <p><strong>Strengths:</strong> Excellent field vision and precise long passes. Shows strong leadership qualities during high-pressure situations. Great work rate both offensively and defensively.</p>
                    <p><strong>Areas for Improvement:</strong> Needs to improve left-footed shots and decision-making in the final third. Can sometimes hold onto the ball for too long.</p>
                    <p><strong>Recommendation:</strong> Focus on drills that require quick one-two passes and shooting with the weaker foot. Recommended for one-on-one coaching for attacking decisions.</p>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="discipline">
            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle className="font-headline flex items-center gap-2">
                            <ShieldX className="text-primary"/>
                            Disciplinary Log
                        </CardTitle>
                        <CardDescription>Record of all disciplinary infractions for this player.</CardDescription>
                    </div>
                    <Button size="sm" className="ml-auto gap-1">
                        <PlusCircle className="h-4 w-4" />
                        Log Infraction
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Infraction</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Sanction</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {player.disciplinaryLog.length > 0 ? (
                                player.disciplinaryLog.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{entry.infraction}</TableCell>
                                        <TableCell>
                                            <Badge variant={severityVariant[entry.severity]}>
                                                {entry.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{entry.sanction}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No disciplinary infractions recorded.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
