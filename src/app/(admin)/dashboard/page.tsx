'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Banknote,
  Users,
  ScanLine,
  ShieldAlert,
  Coins,
  Wallet,
  Calendar,
  Package,
  TrendingUp,
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const avgRevenuePerPlayer = stats.totalPlayers > 0 ? stats.totalRevenue / stats.totalPlayers : 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Primary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/finances">
          <KpiCard
            title="Total Revenue"
            value={`KES ${(stats.totalRevenue || 0).toLocaleString()}`}
            change="+11.5%"
            icon={<Banknote className="size-5 text-muted-foreground" />}
            description="from last month"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Players Enrolled"
            value={String(stats.totalPlayers || 0)}
            change="+2"
            icon={<Users className="size-5 text-muted-foreground" />}
            description="since last week"
          />
        </Link>
        <Link href="/team">
          <KpiCard
            title="Active Staff"
            value={String(stats.activeStaff || 0)}
            change="+1"
            icon={<TrendingUp className="size-5 text-muted-foreground" />}
            description="team members"
          />
        </Link>
        <Link href="/events">
          <KpiCard
            title="Upcoming Events"
            value={String(stats.upcomingEvents || 0)}
            change="+3"
            icon={<Calendar className="size-5 text-muted-foreground" />}
            description="scheduled"
          />
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="col-span-1 lg:col-span-3">
          <RevenueChart />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/inventory">
          <KpiCard
            title="Total Equipment"
            value={String(stats.totalEquipment || 0)}
            change={`${stats.lowStockItems || 0} low`}
            icon={<Package className="size-5 text-muted-foreground" />}
            description="items in inventory"
          />
        </Link>
        <Link href="/inventory">
          <KpiCard
            title="Low Stock Items"
            value={String(stats.lowStockItems || 0)}
            change="Action needed"
            icon={<ShieldAlert className="size-5 text-muted-foreground" />}
            description="below threshold"
          />
        </Link>
        <Link href="/players">
          <KpiCard
            title="Revenue Per Player"
            value={`KES ${avgRevenuePerPlayer.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`}
            change="+3%"
            icon={<Coins className="size-5 text-muted-foreground" />}
            description="average per player"
          />
        </Link>
        {stats.performanceAverages && (
          <KpiCard
            title="Avg Player Speed"
            value={`${(stats.performanceAverages[0]?.avg_speed || 0).toFixed(1)} km/h`}
            change="+2.1%"
            icon={<Wallet className="size-5 text-muted-foreground" />}
            description="performance metric"
          />
        )}
      </div>
    </div>
  );
}
