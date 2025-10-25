
'use client';

import Link from 'next/link';
import { players } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Star } from 'lucide-react';
import { Button } from '../ui/button';

export function ScoutingPortal() {
  const topPlayers = players.sort((a, b) => a.rank - b.rank).slice(0, 10);

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Top Ranked Players</CardTitle>
            <CardDescription>A curated list of top-performing players across the academy.</CardDescription>
        </CardHeader>
      <CardContent>
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
            {topPlayers.map((player) => (
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
                      <AvatarImage src={player.avatarUrl} alt={player.name} />
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
                    {player.highlights.slice(0,2).map(highlight => (
                        <Badge key={highlight} variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            {highlight}
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
