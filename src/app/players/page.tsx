import Link from 'next/link';
import { players } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlayersPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Player Roster</h1>
        <p className="text-muted-foreground">
          Browse and manage all players in the academy.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {players.map((player) => (
          <Link key={player.id} href={`/players/${player.id}`} passHref>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer text-center">
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
