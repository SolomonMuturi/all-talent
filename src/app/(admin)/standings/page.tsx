'use client';

import { StandingsTable, TeamStandingsTable } from "@/components/standings/standings-table";
import { players, Player } from "@/lib/data";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Trophy, User, Star } from "lucide-react";
import Link from "next/link";

export default function StandingsPage() {
  const playersByTeam = players.reduce((acc, player) => {
    const team = player.team;
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  const teamStats = Object.entries(playersByTeam).map(([teamName, teamPlayers]) => {
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
        <KpiCard
          title="Top Performing Team"
          value={topTeam.name}
          icon={<Trophy className="size-5 text-muted-foreground" />}
          description={`${topTeam.points} points in total`}
        />
        <Link href={`/players/${topPlayer.id}`}>
            <KpiCard
              title="Top Scoring Player"
              value={topPlayer.name}
              icon={<User className="size-5 text-muted-foreground" />}
              description={`${topPlayer.points} points`}
            />
        </Link>
        <KpiCard
          title="Most Wins (Team)"
          value={mostWinsTeam.name}
          icon={<Star className="size-5 text-muted-foreground" />}
          description={`${mostWinsTeam.wins} wins`}
        />
      </div>

      <TeamStandingsTable teams={teamStats} />
      <StandingsTable playersByTeam={playersByTeam} />
    </div>
  );
}
