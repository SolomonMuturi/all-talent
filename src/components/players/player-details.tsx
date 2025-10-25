'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Scan, Fingerprint, Footprints, Dumbbell, UserSquare, UserCheck, ShieldX, PlusCircle, HeartPulse, ShieldCheck as ShieldCheckIcon, Target, BrainCircuit, Heart, Users, Gauge, TrendingUp, Zap, Trophy, Award, ExternalLink } from 'lucide-react';

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const metricIcons = {
  // Physical
  speed: <Footprints className="h-5 w-5 text-accent" />,
  stamina: <HeartPulse className="h-5 w-5 text-accent" />,
  strength: <Dumbbell className="h-5 w-5 text-accent" />,
  
  // Technical
  dribbling: <Footprints className="h-5 w-5 text-primary" />,
  shooting: <Target className="h-5 w-5 text-primary" />,
  passing: <Users className="h-5 w-5 text-primary" />,

  // Tactical
  positioning: <BrainCircuit className="h-5 w-5 text-destructive" />,
  'game-reading': <BrainCircuit className="h-5 w-5 text-destructive" />,
  
  // Psycho-Social
  leadership: <Heart className="h-5 w-5 text-green-500" />,
  teamwork: <Users className="h-5 w-5 text-green-500" />,
};

const severityVariant = {
  Low: 'secondary',
  Medium: 'default',
  High: 'destructive',
} as const;

const rtpStatusVariant = {
    'In Treatment': 'destructive',
    'Cleared for Light Training': 'secondary',
    'Cleared to Play': 'default'
} as const;

export function PlayerDetails({ player }: { player: Player }) {
  const getDisciplineScoreColor = (score: number) => {
    if (score > 95) return 'text-green-500';
    if (score > 85) return 'text-yellow-500';
    return 'text-red-500';
  };


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
             <div className="flex justify-center items-center gap-2 mb-4">
               <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=UPID:TT-${String(player.id).padStart(4, '0')}`}
                  width={100}
                  height={100}
                  alt="Player QR Code"
                />
                 <div className="flex flex-col gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-muted/50 w-24">
                              <ShieldCheckIcon className={`h-8 w-8 ${getDisciplineScoreColor(player.disciplineScore)}`} />
                              <p className={`text-2xl font-bold ${getDisciplineScoreColor(player.disciplineScore)}`}>{player.disciplineScore}</p>
                              <p className="text-xs text-muted-foreground">Discipline</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Discipline Score</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <div className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-muted/50 w-24">
                              <Trophy className="h-8 w-8 text-primary" />
                              <p className="text-2xl font-bold">#{player.rank}</p>
                              <p className="text-xs text-muted-foreground">Rank</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Overall Player Rank</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                 </div>
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
          <TabsList className="mb-4 grid w-full grid-cols-7">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="biometrics">Biometrics</TabsTrigger>
            <TabsTrigger value="gps">GPS Data</TabsTrigger>
            <TabsTrigger value="reports">Scouting</TabsTrigger>
            <TabsTrigger value="discipline">Discipline</TabsTrigger>
            <TabsTrigger value="injuries">Injuries</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Quarterly Skills Assessment</CardTitle>
                    <CardDescription>Coach assessment across the 4 pillars of development.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-3 text-primary">Physical</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(player.performanceMetrics.physical).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {metricIcons[key as keyof typeof metricIcons]}
                                        <h4 className="capitalize font-medium">{key}</h4>
                                        <span className="ml-auto text-lg font-bold">{value}</span>
                                    </div>
                                    <Progress value={value} aria-label={`${key} score`} />
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-3 text-primary">Technical</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(player.performanceMetrics.technical).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {metricIcons[key as keyof typeof metricIcons]}
                                        <h4 className="capitalize font-medium">{key}</h4>
                                        <span className="ml-auto text-lg font-bold">{value}</span>
                                    </div>
                                    <Progress value={value} aria-label={`${key} score`} />
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-3 text-destructive">Tactical</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(player.performanceMetrics.tactical).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {metricIcons[key.replace(' ', '-') as keyof typeof metricIcons]}
                                        <h4 className="capitalize font-medium">{key}</h4>
                                        <span className="ml-auto text-lg font-bold">{value}</span>
                                    </div>
                                    <Progress value={value} aria-label={`${key} score`} />
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-3 text-green-500">Psycho-Social</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(player.performanceMetrics.psychoSocial).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {metricIcons[key as keyof typeof metricIcons]}
                                        <h4 className="capitalize font-medium">{key}</h4>
                                        <span className="ml-auto text-lg font-bold">{value}</span>
                                    </div>
                                    <Progress value={value} aria-label={`${key} score`} />
                                </div>
                            ))}
                        </div>
                    </div>
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
                <CardTitle className="font-headline">GPS Performance Data</CardTitle>
                <CardDescription>Player metrics from the last match.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Max Speed</CardTitle>
                        <Gauge className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{player.gpsData.maxSpeed} km/h</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Distance Covered</CardTitle>
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{player.gpsData.distanceCovered} km</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Player Load</CardTitle>
                        <Zap className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{player.gpsData.playerLoad}</div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Movement Heatmap</h3>
                    <Image 
                        src="https://picsum.photos/seed/heatmap1/600/400" 
                        alt="GPS Heatmap"
                        width={600}
                        height={400}
                        className="rounded-lg object-cover w-full"
                        data-ai-hint="football pitch heatmap"
                    />
                </div>
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
           <TabsContent value="injuries">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                  <CardTitle className="font-headline flex items-center gap-2">
                    <HeartPulse className="text-primary" />
                    Injury Log &amp; RTP
                  </CardTitle>
                  <CardDescription>Record of all injuries and Return-to-Play status.</CardDescription>
                </div>
                <Button size="sm" className="ml-auto gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Log Injury
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Injury</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>RTP Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {player.injuryLog.length > 0 ? (
                      player.injuryLog.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell>{entry.injury}</TableCell>
                          <TableCell>
                            <Badge variant={severityVariant[entry.severity]}>
                              {entry.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={rtpStatusVariant[entry.rtpStatus]}>
                                {entry.rtpStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No injuries recorded.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="achievements">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Trophy className="text-primary"/>
                        Earned Certificates
                    </CardTitle>
                    <CardDescription>Certificates for completed training modules.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Module Name</TableHead>
                                <TableHead>Date Awarded</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {player.certificates.length > 0 ? (
                                player.certificates.map((cert) => (
                                    <TableRow key={cert.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Award className="h-4 w-4 text-muted-foreground" />
                                            {cert.moduleName}
                                        </TableCell>
                                        <TableCell>{new Date(cert.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/achievements/certificate/${encodeURIComponent(player.name)}/${encodeURIComponent(cert.moduleName)}`}>
                                                    View Certificate
                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No certificates earned yet.
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
