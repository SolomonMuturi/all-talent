
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';

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

export function ScoutingPortal() {
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [loading, setLoading] = useState(true);

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

  const topPlayers = players.sort((a, b) => a.rank - b.rank).slice(0, 10);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading top players...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Top Ranked Players</CardTitle>
            <CardDescription>A curated list of top-performing players across the academy.</CardDescription>
        </CardHeader>
      <CardContent>
        {topPlayers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No players found</div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Key Highlights</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topPlayers.map((player) => {
              const highlights = player.highlights ? player.highlights.split(',').slice(0, 2) : [];
              return (
              <TableRow key={player.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Trophy className={`h-5 w-5 ${player.rank === 1 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-lg">#{player.rank}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={player.avatar_url || ''} alt={player.name} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{player.name}</span>
                  </div>
                </TableCell>
                <TableCell>{player.age}</TableCell>
                <TableCell>{player.position}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{player.team}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {highlights.map(highlight => (
                        <Badge key={highlight} variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {highlight.trim()}
                        </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/players/${player.id}`}>
                            View Profile
                        </Link>
                    </Button>
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
