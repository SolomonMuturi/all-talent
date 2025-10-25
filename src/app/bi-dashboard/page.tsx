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
  HeartPulse,
  UserCheck,
  ShieldAlert,
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
  const profitPerPlayer = activePlayers > 0 ? netProfit / activePlayers : 0;

  const averageAttendance =
    players.reduce((acc, p) => acc + p.attendance, 0) / activePlayers;
  
  const totalDisciplineInfractions = players.reduce((acc, p) => acc + p.disciplinaryLog.length, 0);

  const injuryDaysLost = players.reduce((acc, p) => {
    return acc + p.injuryLog.reduce((injuryAcc, injury) => {
      if (injury.severity === 'Low') return injuryAcc + 7;
      if (injury.severity === 'Medium') return injuryAcc + 21;
      if (injury.severity === 'High') return injuryAcc + 60;
      return injuryAcc;
    }, 0);
  }, 0);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Business Intelligence Dashboard</h1>
        <p className="text-muted-foreground">
          Deep dive into your academy's performance and financial metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            title="Profit Per Player"
            value={`KES ${profitPerPlayer.toLocaleString(undefined, { maximumFractionDigits: 0})}`}
            icon={<Users className="size-5 text-muted-foreground" />}
            description="YTD Average"
          />
        </Link>
         <KpiCard
            title="Attendance Rate"
            value={`${averageAttendance.toFixed(1)}%`}
            icon={<UserCheck className="size-5 text-muted-foreground" />}
            description="Average across all players"
          />
        <KpiCard
            title="Injury Days Lost"
            value={String(injuryDaysLost)}
            icon={<HeartPulse className="size-5 text-muted-foreground" />}
            description="Total estimated days"
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
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <KpiCard
            title="Discipline Infractions"
            value={String(totalDisciplineInfractions)}
            icon={<ShieldAlert className="size-5 text-muted-foreground" />}
            description="Total logged infractions"
          />
      </div>
    </div>
  );
}
