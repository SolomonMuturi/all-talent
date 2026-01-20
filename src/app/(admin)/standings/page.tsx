'use client';

import { StandingsTable, TeamStandingsTable } from "@/components/standings/standings-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Trophy, User, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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

interface Player {
  id: number;
  name: string;
  rank: number;
  points: number;
  avatarUrl: string | null;
  team: string;
  stats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
  };
}

interface TeamStats {
  name: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
}

export default function StandingsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players?limit=1000');
      
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      
      const data = await response.json();
      
      if (data.success && data.data.players) {
        const dbPlayers: DatabasePlayer[] = data.data.players;
        const formattedPlayers = dbPlayers.map((p: DatabasePlayer) => ({
          id: p.id,
          name: p.name,
          rank: p.rank,
          points: p.points,
          avatarUrl: p.avatar_url,
          team: p.team,
          stats: {
            played: p.stats_played,
            wins: p.stats_wins,
            draws: p.stats_draws,
            losses: p.stats_losses,
          }
        }));
        setPlayers(formattedPlayers);
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
        <div className="text-lg">Loading standings...</div>
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

  const playersByTeam = players.reduce((acc, player) => {
    const team = player.team;
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  const teamStats: TeamStats[] = Object.entries(playersByTeam).map(([teamName, teamPlayers]) => {
    const totalPoints = teamPlayers.reduce((acc, player) => acc + player.points, 0);
    const totalPlayed = teamPlayers.reduce((acc, player) => acc + player.stats.played, 0);
    const totalWins = teamPlayers.reduce((acc, player) => acc + player.stats.wins, 0);
    const totalDraws = teamPlayers.reduce((acc, player) => acc + player.stats.draws, 0);
    const totalLosses = teamPlayers.reduce((acc, player) => acc + player.stats.losses, 0);
    
    return {
      name: teamName,
      points: totalPoints,
      played: totalPlayed,
      wins: totalWins,
      draws: totalDraws,
      losses: totalLosses,
    }
  }).sort((a, b) => b.points - a.points);

  const topTeam = teamStats[0];
  const topPlayer = [...players].sort((a, b) => b.points - a.points)[0];
  const mostWinsTeam = [...teamStats].sort((a, b) => b.wins - a.wins)[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Team & Player Standings</h1>
        <p className="text-muted-foreground">
          View team league tables and individual player points for each team.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <Link href="/standings">
            <KpiCard
            title="Top Performing Team"
            value={topTeam?.name || 'N/A'}
            icon={<Trophy className="size-5 text-muted-foreground" />}
            description={topTeam ? `${topTeam.points} points in total` : 'No data'}
            />
        </Link>
        <Link href={topPlayer ? `/players/${topPlayer.id}` : '#'}>
            <KpiCard
              title="Top Scoring Player"
              value={topPlayer?.name || 'N/A'}
              icon={<User className="size-5 text-muted-foreground" />}
              description={topPlayer ? `${topPlayer.points} points` : 'No data'}
            />
        </Link>
        <Link href="/standings">
            <KpiCard
            title="Most Wins (Team)"
            value={mostWinsTeam?.name || 'N/A'}
            icon={<Star className="size-5 text-muted-foreground" />}
            description={mostWinsTeam ? `${mostWinsTeam.wins} wins` : 'No data'}
            />
        </Link>
      </div>

      <TeamStandingsTable teams={teamStats} />
      <StandingsTable playersByTeam={playersByTeam} />
    </div>
  );
}
