'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [txnRes, playerRes] = await Promise.all([
          fetch('/api/finances/transactions'),
          fetch('/api/players?limit=1000'),
        ]);
        const txnData = await txnRes.json();
        const playerData = await playerRes.json();
        setTransactions(Array.isArray(txnData.data) ? txnData.data : txnData.data?.transactions || []);
        setPlayers(Array.isArray(playerData.data?.players) ? playerData.data.players : []);
      } catch {
        setTransactions([]);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getPlayerByFullName = (name: string) => players.find((p: any) => p.name === name);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="font-headline">Recent Transactions</CardTitle>
          <CardDescription>
            {loading
              ? 'Loading...'
              : `You made ${transactions.length} transactions this month.`}
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
          <Link href="/finances">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center text-muted-foreground">No transactions found.</div>
        ) : (
          recentTransactions.map((transaction) => {
            const player = getPlayerByFullName(transaction.player_name || transaction.playerName);
            return (
              <div key={transaction.id} className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  {player ? (
                    <>
                      <AvatarImage src={player.avatar_url || player.avatarUrl} alt={player.name} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback>A</AvatarFallback>
                  )}
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {transaction.player_name || transaction.playerName || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.type}
                  </p>
                </div>
                <div className={`ml-auto font-medium ${transaction.amount > 0 ? '' : 'text-destructive'}`}>
                  {transaction.amount > 0 ? '+' : ''}KES {Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
