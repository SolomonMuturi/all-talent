import Link from 'next/link';
import { players } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trophy, Users, Cake, Shield } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';

export default function PlayersPage() {
  const totalPlayers = players.length;
  const averageAge = players.reduce((acc, p) => acc + p.age, 0) / totalPlayers;

  const teamCounts = players.reduce((acc, player) => {
    acc[player.team] = (acc[player.team] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPopulousTeam = Object.entries(teamCounts).sort((a, b) => b[1] - a[1])[0][0];
  
  const playersByTeam = players.reduce((acc, player) => {
    const team = player.team;
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(player);
    return acc;
  }, {} as Record<string, typeof players>);


  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Player Roster</h1>
          <p className="text-muted-foreground">
            Browse and manage all players in the academy.
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
        <KpiCard
          title="Total Players"
          value={String(totalPlayers)}
          icon={<Users className="size-5 text-muted-foreground" />}
          description="Across all teams"
        />
        <KpiCard
          title="Average Age"
          value={averageAge.toFixed(1)}
          icon={<Cake className="size-5 text-muted-foreground" />}
          description="Average player age"
        />
        <KpiCard
          title="Most Populous Team"
          value={mostPopulousTeam}
          icon={<Shield className="size-5 text-muted-foreground" />}
          description={`${teamCounts[mostPopulousTeam]} players`}
        />
      </div>

      {Object.entries(playersByTeam).map(([team, teamPlayers]) => (
        <div key={team}>
          <h2 className="text-xl font-semibold tracking-tight font-headline mb-4">{team}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {teamPlayers.sort((a,b) => a.rank - b.rank).map((player) => (
              <Link key={player.id} href={`/players/${player.id}`} passHref>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer text-center relative">
                   <Badge className="absolute top-2 right-2 flex gap-1 items-center" variant={player.rank === 1 ? 'default' : 'secondary'}>
                      <Trophy className="h-3 w-3" />
                      Rank #{player.rank}
                   </Badge>
                  <CardContent className="flex flex-col items-center p-6">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="athlete portrait"/>
                      <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.position}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
