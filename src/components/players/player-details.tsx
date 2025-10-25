'use client';

import Image from 'next/image';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Scan, Fingerprint, Footprints, Gauge, Dumbbell } from 'lucide-react';

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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const metricIcons = {
  speed: <Footprints className="h-5 w-5 text-accent" />,
  stamina: <Gauge className="h-5 w-5 text-accent" />,
  shooting: <Dumbbell className="h-5 w-5 text-accent" />,
  passing: <Dumbbell className="h-5 w-5 text-accent" />,
};

export function PlayerDetails({ player }: { player: Player }) {
  const performanceData = Object.entries(player.performanceMetrics).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={player.avatarUrl} alt={player.name} />
              <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold font-headline">{player.name}</h2>
            <p className="text-muted-foreground">{player.position}</p>
            <p className="text-sm text-muted-foreground">Age: {player.age}</p>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4 w-full text-sm">
                <div className="text-left"><strong>Team:</strong></div>
                <div className="text-right">{player.team}</div>
                <div className="text-left"><strong>Attendance:</strong></div>
                <div className="text-right">{player.attendance}%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-lg">Biometric Validation</CardTitle>
                <CardDescription>Last clock-in: 8:02 AM</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <Fingerprint className="w-16 h-16 text-primary" />
                <p className="text-sm text-muted-foreground">Use scanner to validate attendance.</p>
                <Button className="w-full">
                    <Scan className="mr-2 h-4 w-4" />
                    Clock In / Out
                </Button>
            </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Tabs defaultValue="performance">
          <TabsList className="mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="gps">GPS Data</TabsTrigger>
            <TabsTrigger value="reports">Scouting Reports</TabsTrigger>
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
                    className="rounded-lg object-cover"
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
        </Tabs>
      </div>
    </div>
  );
}
