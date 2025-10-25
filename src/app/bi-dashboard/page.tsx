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

export default function BiDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Business Intelligence Dashboard</h1>
        <p className="text-muted-foreground">
          Deep dive into your academy's performance and financial metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Revenue"
          value="KES 1,250,000"
          icon={<Banknote className="size-5 text-muted-foreground" />}
          description="YTD"
        />
        <KpiCard
          title="Total Expenses"
          value="KES 980,000"
          icon={<TrendingDown className="size-5 text-muted-foreground" />}
          description="YTD"
        />
        <KpiCard
          title="Net Profit"
          value="KES 270,000"
          icon={<DollarSign className="size-5 text-muted-foreground" />}
          description="YTD"
        />
        <KpiCard
          title="Active Players"
          value="152"
          icon={<Users className="size-5 text-muted-foreground" />}
          description="Across all teams"
        />
        <KpiCard
          title="Player Growth"
          value="+15%"
          icon={<TrendingUp className="size-5 text-muted-foreground" />}
          description="Since last quarter"
        />
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
