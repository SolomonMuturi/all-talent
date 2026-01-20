'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Scan, Fingerprint, Footprints, Dumbbell, UserSquare, UserCheck, ShieldX, PlusCircle, HeartPulse, ShieldCheck as ShieldCheckIcon, Target, BrainCircuit, Heart, Users, Gauge, TrendingUp, Zap, Trophy, Award, ExternalLink, BookOpen, AlertCircle } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { PlayerBook } from './player-book';
import { useToast } from '@/hooks/use-toast';

// Define Player interface based on database structure
interface Player {
  id: number;
  name: string;
  age: number;
  position: string;
  avatarUrl: string;
  team: string;
  attendance: number;
  disciplineScore: number;
  rank: number;
  points: number;
  stats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
  };
  highlights: string[];
  gpsData: {
    maxSpeed: number;
    distanceCovered: number;
    playerLoad: number;
  };
  performanceMetrics: {
    physical: {
      speed: number;
      stamina: number;
      strength: number;
    };
    technical: {
      dribbling: number;
      shooting: number;
      passing: number;
    };
    tactical: {
      positioning: number;
      'game reading': number;
    };
    psychoSocial: {
      leadership: number;
      teamwork: number;
    };
  };
  disciplinaryLog: Array<{
    id: number;
    date: string;
    infraction: string;
    severity: 'Low' | 'Medium' | 'High';
    sanction: string;
  }>;
  injuryLog: Array<{
    id: number;
    date: string;
    injury: string;
    severity: 'Low' | 'Medium' | 'High';
    rtpStatus: 'In Treatment' | 'Cleared for Light Training' | 'Cleared to Play';
  }>;
  certificates: Array<{
    id: string;
    moduleName: string;
    date: string;
  }>;
}

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
  positioning: <BrainCircuit className="h-5 w-5 text-primary" />,
  'game-reading': <BrainCircuit className="h-5 w-5 text-primary" />,
  
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

interface PlayerDetailsProps {
  playerId: number;
}

export function PlayerDetails({ playerId }: PlayerDetailsProps) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookOpen, setBookOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayer();
  }, [playerId]);

  const fetchPlayer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/players/${playerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch player: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPlayer(data.data);
      } else {
        setError(data.message || 'Failed to load player data');
      }
    } catch (err) {
      console.error('Error fetching player:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getDisciplineScoreColor = (score: number) => {
    if (score > 95) return 'text-green-500';
    if (score > 85) return 'text-yellow-500';
    return 'text-primary';
  };

  const handleAddInfraction = async () => {
    // In a real app, this would open a form modal
    // For now, just show a toast
    toast({
      title: "Feature Coming Soon",
      description: "Infraction logging will be available in the next update.",
    });
  };

  const handleAddInjury = async () => {
    // In a real app, this would open a form modal
    toast({
      title: "Feature Coming Soon",
      description: "Injury logging will be available in the next update.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <div className="text-lg">Loading player details...</div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-lg font-semibold">Error Loading Player</div>
        <div className="text-sm text-muted-foreground text-center max-w-md">
          {error || 'Player not found. The player may have been removed or you may not have permission to view this profile.'}
        </div>
        <Button onClick={fetchPlayer}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="font-headline text-lg flex items-center gap-2">
                <UserSquare className="text-primary"/>
                Digital ID Card
              </CardTitle>
                <Dialog open={isBookOpen} onOpenChange={setBookOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <BookOpen className="mr-2 h-4 w-4" />
                            View Book
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0 h-[90vh]">
                        <div className="w-full h-full overflow-y-auto">
                            <PlayerBook player={player} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage 
                src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random`} 
                alt={player.name} 
              />
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
                  className="rounded-lg border"
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
                          <p>Discipline Score: {player.disciplineScore}/100</p>
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
                <div className="text-left text-muted-foreground">Age:</div>
                <div className="text-right font-medium">{player.age}</div>
                <div className="text-left text-muted-foreground">Points:</div>
                <div className="text-right font-medium">{player.points}</div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Highlights Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">Performance Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            {player.highlights && player.highlights.length > 0 ? (
              <ul className="space-y-2">
                {player.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className="text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No highlights recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Tabs defaultValue="performance">
          <TabsList className="mb-4 grid w-full grid-cols-7">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="gps">GPS Data</TabsTrigger>
            <TabsTrigger value="discipline">Discipline</TabsTrigger>
            <TabsTrigger value="injuries">Injuries</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
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
                                        <span className="ml-auto text-lg font-bold">{value}/100</span>
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
                                        <span className="ml-auto text-lg font-bold">{value}/100</span>
                                    </div>
                                    <Progress value={value} aria-label={`${key} score`} />
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-3 text-primary">Tactical</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(player.performanceMetrics.tactical).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {metricIcons[key.replace(' ', '-') as keyof typeof metricIcons]}
                                        <h4 className="capitalize font-medium">{key}</h4>
                                        <span className="ml-auto text-lg font-bold">{value}/100</span>
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
                                        <span className="ml-auto text-lg font-bold">{value}/100</span>
                                    </div>
                                    <Progress value={value} aria-label={`${key} score`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Match Statistics</CardTitle>
                <CardDescription>Season performance statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold">{player.stats.played}</div>
                    <div className="text-sm text-muted-foreground">Matches Played</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{player.stats.wins}</div>
                    <div className="text-sm text-muted-foreground">Wins</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">{player.stats.draws}</div>
                    <div className="text-sm text-muted-foreground">Draws</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{player.stats.losses}</div>
                    <div className="text-sm text-muted-foreground">Losses</div>
                  </div>
                </div>
                {player.stats.played > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Win Rate</span>
                      <span className="text-sm font-bold">
                        {((player.stats.wins / player.stats.played) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={(player.stats.wins / player.stats.played) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
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
                        <div className="text-2xl font-bold">{player.gpsData.maxSpeed || 0} km/h</div>
                        <p className="text-xs text-muted-foreground">Top speed achieved</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Distance Covered</CardTitle>
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{player.gpsData.distanceCovered || 0} km</div>
                        <p className="text-xs text-muted-foreground">Total distance</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Player Load</CardTitle>
                        <Zap className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{player.gpsData.playerLoad || 0}</div>
                        <p className="text-xs text-muted-foreground">Physical exertion</p>
                    </CardContent>
                  </Card>
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Movement Heatmap</h3>
                    <div className="bg-muted/50 rounded-lg p-8 flex items-center justify-center">
                      <div className="text-center">
                        <Gauge className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">GPS data visualization coming soon</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Connect GPS tracking device to see heatmap
                        </p>
                      </div>
                    </div>
                </div>
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
                    <Button size="sm" className="ml-auto gap-1" onClick={handleAddInfraction}>
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
                                        <div className="flex flex-col items-center gap-2">
                                          <ShieldCheckIcon className="h-8 w-8 text-green-500" />
                                          <p className="text-sm font-medium">No disciplinary issues</p>
                                          <p className="text-xs text-muted-foreground">Player maintains excellent discipline</p>
                                        </div>
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
                <Button size="sm" className="ml-auto gap-1" onClick={handleAddInjury}>
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
                          <div className="flex flex-col items-center gap-2">
                            <HeartPulse className="h-8 w-8 text-green-500" />
                            <p className="text-sm font-medium">No injuries recorded</p>
                            <p className="text-xs text-muted-foreground">Player is injury-free</p>
                          </div>
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
                                                <Link href={`/achievements/certificate/${player.id}/${encodeURIComponent(cert.moduleName)}`}>
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
                                        <div className="flex flex-col items-center gap-2">
                                          <Award className="h-8 w-8 text-muted-foreground" />
                                          <p className="text-sm font-medium">No certificates yet</p>
                                          <p className="text-xs text-muted-foreground">Complete training modules to earn certificates</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Additional Details</CardTitle>
                <CardDescription>Additional player information and notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Player Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Position</p>
                      <p className="font-medium">{player.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Team</p>
                      <p className="font-medium">{player.team}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">{player.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Attendance</p>
                      <p className="font-medium">{player.attendance}%</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Performance Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Overall Rank</span>
                      <span className="font-bold">#{player.rank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Discipline Score</span>
                      <span className={`font-bold ${getDisciplineScoreColor(player.disciplineScore)}`}>
                        {player.disciplineScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Points</span>
                      <span className="font-bold">{player.points}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}