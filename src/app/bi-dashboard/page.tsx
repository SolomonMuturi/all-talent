import Link from 'next/link';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { PlayerDistributionChart } from '@/components/bi-dashboard/player-distribution-chart';
import { RevenueVsExpenseChart } from '@/components/bi-dashboard/revenue-vs-expense-chart';
import {
  Banknote,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { transactions, players } from '@/lib/data';

export default function BiDashboardPage() {
  const totalRevenue = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const activePlayers = players.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Business Intelligence Dashboard</h1>
        <p className="text-muted-foreground">
          Deep dive into your academy's performance and financial metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Link href="/finances">
          <KpiCard
            title="Total Revenue"
            value={`KES ${totalRevenue.toLocaleString()}`}
            icon={<Banknote className="size-5 text-muted-foreground" />}
            description="YTD"
          />
        </Link>
        <Link href="/finances">
          <KpiCard
            title="Total Expenses"
            value={`KES ${totalExpenses.toLocaleString()}`}
            icon={<TrendingDown className="size-5 text-muted-foreground" />}
            description="YTD"
          />
        </Link>
        <Link href="/finances">
          <KpiCard
            title="Net Profit"
            value={`KES ${netProfit.toLocaleString()}`}
            icon={<DollarSign className="size-5 text-muted-foreground" />}
            description="YTD"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Active Players"
            value={String(activePlayers)}
            icon={<Users className="size-5 text-muted-foreground" />}
            description="Across all teams"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Player Growth"
            value="+15%"
            icon={<TrendingUp className="size-5 text-muted-foreground" />}
            description="Since last quarter"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="col-span-1 lg:col-span-3">
          <RevenueVsExpenseChart />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <PlayerDistributionChart />
        </div>
      </div>
    </div>
  );
}
