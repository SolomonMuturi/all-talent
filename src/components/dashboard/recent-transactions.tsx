// components/dashboard/recent-transactions.tsx
'use client';

import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/dashboard/stats');
        
        if (!res.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const data = await res.json();
        if (data.success && data.data?.recentTransactions) {
          setTransactions(data.data.recentTransactions.slice(0, 5));
        } else {
          setTransactions([]);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setError(error instanceof Error ? error.message : 'Failed to load transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed' || statusLower === 'success') {
      return 'text-green-600 bg-green-50';
    } else if (statusLower === 'pending' || statusLower === 'processing') {
      return 'text-yellow-600 bg-yellow-50';
    } else if (statusLower === 'failed' || statusLower === 'error') {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  const getTypeIcon = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower === 'payment' || typeLower === 'revenue' || typeLower === 'income') {
      return <ArrowUpRight className="size-4 text-green-600" />;
    }
    return <ArrowDownRight className="size-4 text-red-600" />;
  };

  const getInitials = (name: string) => {
    if (!name || name === 'N/A') return 'A';
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="font-headline">Recent Transactions</CardTitle>
          <CardDescription>
            {loading 
              ? 'Loading transactions...' 
              : transactions.length === 0 
                ? 'No transactions found' 
                : `Showing ${transactions.length} recent transactions`
            }
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
          <Link href="/finances">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Loading transactions...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-500">
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarFallback>{getInitials(transaction.playerName)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">
                    {transaction.playerName || 'N/A'}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    {getTypeIcon(transaction.type)}
                    {transaction.type || 'Unknown'}
                  </span>
                  <span>•</span>
                  <span>{transaction.paymentMethod || 'N/A'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>
              <div className={`font-medium whitespace-nowrap ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.amount > 0 ? '+' : ''}KES {Math.abs(transaction.amount || 0).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}