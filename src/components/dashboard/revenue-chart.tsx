'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

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

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
};

export function RevenueChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      setLoading(true);
      try {
        const res = await fetch('/api/finances/transactions');
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.transactions)) {
          // Group by month and sum revenue
          const monthly: Record<string, number> = {};
          data.data.transactions.forEach((txn: any) => {
            if (txn.amount > 0) {
              const date = new Date(txn.date);
              const month = date.toLocaleString('default', { month: 'long' });
              monthly[month] = (monthly[month] || 0) + txn.amount;
            }
          });
          // Sort months by order
          const monthsOrder = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ];
          const chartArr = monthsOrder
            .map((month) =>
              monthly[month] ? { month, revenue: monthly[month] } : null
            )
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
    fetchRevenue();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
