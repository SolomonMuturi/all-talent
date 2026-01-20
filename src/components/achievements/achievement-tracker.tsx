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
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CertificateGenerator } from './certificate-generator';
import { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface DatabasePlayer {
  id: number;
  name: string;
  age: number;
  position: string;
  avatar_url: string | null;
  team: string;
  attendance: number;
  discipline_score: number;
  rank: number;
  points: number;
  stats_played: number;
  stats_wins: number;
  stats_draws: number;
  stats_losses: number;
  highlights: string;
  gps_max_speed: number | null;
  gps_distance_covered: number | null;
  gps_player_load: number | null;
  physical_speed: number;
  physical_stamina: number;
  physical_strength: number;
  technical_dribbling: number;
  technical_shooting: number;
  technical_passing: number;
  tactical_positioning: number;
  tactical_game_reading: number;
  psycho_leadership: number;
  psycho_teamwork: number;
  certificate_count: number;
  infraction_count: number;
  injury_count: number;
}

interface Achievement {
  playerId: number;
  playerName: string;
  achievement: string;
  date: string;
}

export function AchievementTracker() {
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [signatory1, setSignatory1] = useState({ name: 'John Omondi', title: 'Head Coach' });
  const [signatory2, setSignatory2] = useState({ name: 'Esther Chepkoech', title: 'Academy Director' });
  const [academyName, setAcademyName] = useState('TalantaTrack Academy');
  const [contactInfo, setContactInfo] = useState('123 Football Lane, Nairobi, Kenya | +254 700 000 000');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players?limit=1000');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.players) {
          setPlayers(data.data.players);
        }
      }
    } catch (err) {
      console.error('Failed to fetch players:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create achievements list from players with certificate data
  const achievements: Achievement[] = players
    .filter(p => p.certificate_count && p.certificate_count > 0)
    .flatMap(p => {
      const count = p.certificate_count || 0;
      // Create certificate entries for each certificate count
      return Array.from({ length: Math.min(count, 5) }).map((_, i) => ({
        playerId: p.id,
        playerName: p.name,
        achievement: `Certificate ${i + 1}`,
        date: new Date().toLocaleDateString('en-CA'), // Format: YYYY-MM-DD
      }));
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                    {loading ? (
                      <div className="text-center py-4 text-muted-foreground">Loading achievements...</div>
                    ) : achievements.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">No achievements yet</div>
                    ) : (
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
                            {achievements.map((item, index) => (
                                <TableRow key={index} className="cursor-pointer">
                                  <TableCell className="font-medium">
                                      <Link href={`/players/${item.playerId}`} className="hover:underline">
                                        {item.playerName}
                                      </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                            <Award className="size-3" />
                                            {item.achievement}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>Training Module</TableCell>
                                    <TableCell>{item.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
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
