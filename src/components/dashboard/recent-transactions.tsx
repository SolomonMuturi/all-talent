import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { transactions, players } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const getPlayerByFullName = (name: string) => players.find(p => p.name === name);

export function RecentTransactions() {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="font-headline">Recent Transactions</CardTitle>
          <CardDescription>
            You made {transactions.length} transactions this month.
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
        {recentTransactions.map((transaction) => {
          const player = getPlayerByFullName(transaction.playerName);
          return (
            <div key={transaction.id} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                {player ? (
                  <>
                    <AvatarImage src={player.avatarUrl} alt={player.name} />
                    <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback>A</AvatarFallback>
                )}
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">
                  {transaction.playerName}
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
        })}
      </CardContent>
    </Card>
  );
}
