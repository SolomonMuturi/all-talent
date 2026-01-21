'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export function RevenueVsExpenseChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        const res = await fetch('/api/finances/transactions');
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.transactions)) {
          // Group by month and sum revenue/expenses
          const monthly: Record<string, { revenue: number; expenses: number }> = {};
          data.data.transactions.forEach((txn: any) => {
            const date = new Date(txn.date);
            const month = date.toLocaleString('default', { month: 'short' });
            if (!monthly[month]) monthly[month] = { revenue: 0, expenses: 0 };
            if (txn.amount > 0) {
              monthly[month].revenue += txn.amount;
            } else {
              monthly[month].expenses += Math.abs(txn.amount);
            }
          });
          // Sort months by order
          const monthsOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const chartArr = monthsOrder
            .map(month => monthly[month] ? { month, ...monthly[month] } : null)
            .filter(Boolean);
          setChartData(chartArr);
        } else {
          setChartData([]);
        }
      } catch {
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, []);

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--chart-1))',
    },
    expenses: {
      label: 'Expenses',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="font-headline">Revenue vs. Expenses</CardTitle>
          <CardDescription>Monthly breakdown</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
          <Link href="/finances">
            View breakdown
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => `KES ${Number(value) / 1000}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Legend />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
