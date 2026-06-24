// app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Banknote,
  Users,
  ShieldAlert,
  Coins,
  Calendar,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/dashboard/stats');
        
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.error || 'Failed to fetch dashboard stats');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  const avgRevenuePerPlayer = stats.totalPlayers > 0 ? stats.totalRevenue / stats.totalPlayers : 0;

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6">
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
        <Link href="/finances">
          <KpiCard
            title="Total Expenses"
            value={`KES ${(stats.totalExpenses || 0).toLocaleString()}`}
            change="+5.2%"
            icon={<TrendingDown className="size-5 text-muted-foreground" />}
            description="from last month"
          />
        </Link>
        <Link href="/finances">
          <KpiCard
            title="Net Profit"
            value={`KES ${(stats.netProfit || 0).toLocaleString()}`}
            change="+18.3%"
            icon={<DollarSign className="size-5 text-muted-foreground" />}
            description="revenue minus expenses"
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
      </div>

      {/* Charts Section */}
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
    </div>
  );
}