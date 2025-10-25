import { StandingsTable, TeamStandingsTable } from "@/components/standings/standings-table";
import { players, Player } from "@/lib/data";

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


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Team & Player Standings</h1>
        <p className="text-muted-foreground">
          View team league tables and individual player points for each team.
        </p>
      </div>
      <TeamStandingsTable teams={teamStats} />
      <StandingsTable playersByTeam={playersByTeam} />
    </div>
  );
}
