'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trophy, Users, Cake, Shield } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';

// Define Player type based on database structure
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

export default function PlayersPage() {
  const [players, setPlayers] = useState<DatabasePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPlayers(data.data);
      } else {
        setError(data.message || 'Failed to load players');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch players');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading players...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg text-red-600">Error: {error}</div>
        <Button onClick={fetchPlayers}>Retry</Button>
      </div>
    );
  }

  const totalPlayers = players.length;
  const averageAge = players.length > 0 
    ? players.reduce((acc, p) => acc + p.age, 0) / totalPlayers 
    : 0;

  const teamCounts = players.reduce((acc, player) => {
    acc[player.team] = (acc[player.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopulousTeam = totalPlayers > 0 
    ? Object.entries(teamCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'No teams';
  
  const playersByTeam = players.reduce((acc, player) => {
    const team = player.team;
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(player);
    return acc;
  }, {} as Record<string, DatabasePlayer[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Player Roster</h1>
          <p className="text-muted-foreground">
            Browse and manage all players in the academy. Total: {totalPlayers} players
          </p>
        </div>
        <Button asChild>
          <Link href="/players/enroll">
            <PlusCircle className="mr-2 h-4 w-4" />
            Enroll Player
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/players">
          <KpiCard
            title="Total Players"
            value={String(totalPlayers)}
            icon={<Users className="size-5 text-muted-foreground" />}
            description="Across all teams"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Average Age"
            value={averageAge.toFixed(1)}
            icon={<Cake className="size-5 text-muted-foreground" />}
            description="Average player age"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Most Populous Team"
            value={mostPopulousTeam}
            icon={<Shield className="size-5 text-muted-foreground" />}
            description={totalPlayers > 0 ? `${teamCounts[mostPopulousTeam]} players` : 'No players'}
          />
        </Link>
      </div>

      {Object.entries(playersByTeam).map(([team, teamPlayers]) => (
        <div key={team}>
          <h2 className="text-xl font-semibold tracking-tight font-headline mb-4">
            {team} ({teamPlayers.length} players)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {teamPlayers.sort((a, b) => a.rank - b.rank).map((player) => (
              <Link key={player.id} href={`/players/${player.id}`} passHref>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer text-center relative">
                  <Badge className="absolute top-2 right-2 flex gap-1 items-center" 
                         variant={player.rank === 1 ? 'default' : 'secondary'}>
                    <Trophy className="h-3 w-3" />
                    Rank #{player.rank}
                  </Badge>
                  <CardContent className="flex flex-col items-center p-6">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage 
                        src={player.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random`} 
                        alt={player.name}
                        data-ai-hint="athlete portrait"
                      />
                      <AvatarFallback>
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.position}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>Age: {player.age}</span>
                      <span>•</span>
                      <span>Pts: {player.points}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {totalPlayers === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Players Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by enrolling your first player.
            </p>
            <Button asChild>
              <Link href="/players/enroll">
                <PlusCircle className="mr-2 h-4 w-4" />
                Enroll First Player
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}