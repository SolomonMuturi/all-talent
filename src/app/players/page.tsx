import Link from 'next/link';
import { players } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trophy } from 'lucide-react';

export default function PlayersPage() {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {players.sort((a,b) => a.rank - b.rank).map((player) => (
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
  );
}
