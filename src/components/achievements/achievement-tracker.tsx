'use client';

import { Award, Star, Trophy, Download, Edit } from 'lucide-react';
import Link from 'next/link';
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
import { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const achievements = [
  { playerId: 1, achievement: 'Player of the Match', date: '2024-07-10', event: 'U-17 Friendly' },
  { playerId: 2, achievement: 'Most Assists', date: '2024-06-15', event: 'League Season' },
  { playerId: 6, achievement: 'Golden Boot', date: '2024-06-15', event: 'League Season' },
  { playerId: 1, achievement: 'Player of the Match', date: '2024-05-25', event: 'Cup Final' },
];

export function AchievementTracker() {
  const [signatory1, setSignatory1] = useState({ name: 'John Omondi', title: 'Head Coach' });
  const [signatory2, setSignatory2] = useState({ name: 'Esther Chepkoech', title: 'Academy Director' });
  const [academyName, setAcademyName] = useState('TalantaTrack Academy');
  const [contactInfo, setContactInfo] = useState('123 Football Lane, Nairobi, Kenya | +254 700 000 000');


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
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
                                <TableRow key={index} className="cursor-pointer">
                                  <TableCell className="font-medium">
                                      <Link href={`/players/${player?.id}`} className="hover:underline">
                                        {player?.name}
                                      </Link>
                                    </TableCell>
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
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Edit className="size-5" />
                        Customize Certificate Branding
                    </CardTitle>
                    <CardDescription>Edit the details that appear on every certificate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Academy Name</Label>
                            <Input value={academyName} onChange={(e) => setAcademyName(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Academy Contact Info</Label>
                            <Input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Signatory 1 Name</Label>
                            <Input value={signatory1.name} onChange={(e) => setSignatory1({ ...signatory1, name: e.target.value })} />
                        </div>
                         <div className="space-y-2">
                            <Label>Signatory 1 Title</Label>
                            <Input value={signatory1.title} onChange={(e) => setSignatory1({ ...signatory1, title: e.target.value })} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Signatory 2 Name</Label>
                            <Input value={signatory2.name} onChange={(e) => setSignatory2({ ...signatory2, name: e.target.value })} />
                        </div>
                         <div className="space-y-2">
                            <Label>Signatory 2 Title</Label>
                            <Input value={signatory2.title} onChange={(e) => setSignatory2({ ...signatory2, title: e.target.value })} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <CertificateGenerator branding={{ academyName, contactInfo, signatory1, signatory2 }} />
        </div>
    </div>
  );
}
