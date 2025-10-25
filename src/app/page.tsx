import {
  Banknote,
  Users,
  ScanLine,
  ShieldAlert,
  Coins,
  Wallet,
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { transactions, players } from '@/lib/data';

export default function DashboardPage() {
  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const activePlayers = players.length;
  const avgExpensePerPlayer = activePlayers > 0 ? totalExpenses / activePlayers : 0;
  const totalRevenue = transactions
    .filter((t) => t.type === 'Fee Payment')
    .reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitPerPlayer = activePlayers > 0 ? netProfit / activePlayers : 0;


  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Revenue"
          value={`KES ${totalRevenue.toLocaleString()}`}
          change="+11.5%"
          icon={<Banknote className="size-5 text-muted-foreground" />}
          description="from last month"
        />
        <KpiCard
          title="Players Enrolled"
          value={String(activePlayers)}
          change="+2"
          icon={<Users className="size-5 text-muted-foreground" />}
          description="since last week"
        />
        <KpiCard
          title="Cost Per Player"
          value={`KES ${avgExpensePerPlayer.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          change="+3%"
          icon={<Coins className="size-5 text-muted-foreground" />}
          description="from last month"
        />
        <KpiCard
          title="Profit Per Player"
          value={`KES ${profitPerPlayer.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          change="-2%"
          icon={<Wallet className="size-5 text-muted-foreground" />}
          description="from last month"
        />
        <KpiCard
          title="Attendance Rate"
          value="92.8%"
          change="-1.2%"
          icon={<ScanLine className="size-5 text-muted-foreground" />}
          description="from last month"
        />
        <KpiCard
          title="Fraud Alerts"
          value="3"
          change="+1"
          icon={<ShieldAlert className="size-5 text-muted-foreground" />}
          description="in the last 24 hours"
        />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="col-span-1 lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
