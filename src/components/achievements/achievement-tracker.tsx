'use client';

import { Award, Star, Trophy, Download } from 'lucide-react';
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
import { players } from '@/lib/data';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CertificateGenerator } from './certificate-generator';

const achievements = [
  { playerId: 1, achievement: 'Player of the Match', date: '2024-07-10', event: 'U-17 Friendly' },
  { playerId: 2, achievement: 'Most Assists', date: '2024-06-15', event: 'League Season' },
  { playerId: 6, achievement: 'Golden Boot', date: '2024-06-15', event: 'League Season' },
  { playerId: 1, achievement: 'Player of the Match', date: '2024-05-25', event: 'Cup Final' },
];

export function AchievementTracker() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Trophy className="size-5" /> Recent Awards
                    </CardTitle>
                    <CardDescription>
                    A log of all individual player awards and honors.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Player</TableHead>
                                <TableHead>Award</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {achievements.map((item, index) => {
                                const player = players.find(p => p.id === item.playerId);
                                return (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{player?.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                            <Award className="size-3" />
                                            {item.achievement}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{item.event}</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <CertificateGenerator />
        </div>
    </div>
  );
}
