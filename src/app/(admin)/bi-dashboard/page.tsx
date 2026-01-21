'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { PlayerDistributionChart } from '@/components/bi-dashboard/player-distribution-chart';
import { RevenueVsExpenseChart } from '@/components/bi-dashboard/revenue-vs-expense-chart';
import {
  Users,
  TrendingUp,
  DollarSign,
  HeartPulse,
  UserCheck,
  ShieldAlert,
  BrainCircuit,
} from 'lucide-react';

export default function BiDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Fallbacks if API fails
  const totalRevenue = stats?.totalRevenue || 0;
  const totalPlayers = stats?.totalPlayers || 0;
  const netProfit = totalRevenue; // If you want to show profit, adjust API to return netProfit
  const profitPerPlayer = totalPlayers > 0 ? netProfit / totalPlayers : 0;
  const averageAttendance = stats?.performanceAverages?.avg_attendance || 0;
  const injuryDaysLost = stats?.injuryDaysLost || 0;
  const totalDisciplineInfractions = stats?.totalDisciplineInfractions || 0;
  const averagePlayerRank = stats?.performanceAverages?.avg_rank || 0;
  const averageSkillScore = (() => {
    if (!stats?.performanceAverages) return 0;
    const avg = stats.performanceAverages;
    const values = [
      avg.avg_speed,
      avg.avg_stamina,
      avg.avg_strength,
      avg.avg_dribbling,
      avg.avg_shooting,
      avg.avg_passing,
    ].filter((v) => typeof v === 'number');
    return values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">
          Business Intelligence Dashboard
        </h1>
        <p className="text-muted-foreground">
          Deep dive into your academy&apos;s performance and financial metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/finances">
          <KpiCard
            title="Net Profit"
            value={netProfit > 0 ? `KES ${netProfit.toLocaleString()}` : '-'}
            icon={<DollarSign className="size-5 text-muted-foreground" />}
            description="YTD"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Profit Per Player"
            value={
              profitPerPlayer > 0
                ? `KES ${profitPerPlayer.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}`
                : '-'
            }
            icon={<Users className="size-5 text-muted-foreground" />}
            description="YTD Average"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Attendance Rate"
            value={averageAttendance ? `${averageAttendance.toFixed(1)}%` : '-'}
            icon={<UserCheck className="size-5 text-muted-foreground" />}
            description="Average across all players"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Injury Days Lost"
            value={injuryDaysLost ? String(injuryDaysLost) : '-'}
            icon={<HeartPulse className="size-5 text-muted-foreground" />}
            description="Total estimated days"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/players">
          <KpiCard
            title="Discipline Infractions"
            value={
              totalDisciplineInfractions
                ? String(totalDisciplineInfractions)
                : '-'
            }
            icon={<ShieldAlert className="size-5 text-muted-foreground" />}
            description="Total logged infractions"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Average Skill Score"
            value={averageSkillScore ? averageSkillScore.toFixed(1) : '-'}
            icon={<BrainCircuit className="size-5 text-muted-foreground" />}
            description="Across all players &amp; skills"
          />
        </Link>
        <Link href="/standings">
          <KpiCard
            title="Average Player Rank"
            value={averagePlayerRank ? `#${averagePlayerRank.toFixed(1)}` : '-'}
            icon={<TrendingUp className="size-5 text-muted-foreground" />}
            description="Across all players"
          />
        </Link>
      </div>
    </div>
  );
}
