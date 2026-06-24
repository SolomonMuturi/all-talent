// components/dashboard/revenue-chart.tsx
'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts';

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
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--chart-2))',
  },
};

export function RevenueChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/dashboard/stats');
        
        if (!res.ok) {
          throw new Error('Failed to fetch chart data');
        }
        
        const data = await res.json();
        if (data.success && data.data?.monthlyData) {
          setChartData(data.data.monthlyData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load chart data');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchChartData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Revenue Overview</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[280px] text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Revenue Overview</CardTitle>
          <CardDescription>Monthly revenue vs expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[280px] text-muted-foreground">
            {error || 'No revenue data available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total revenue and expenses for display
  const totalRevenue = chartData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + (item.expenses || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue vs expenses</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartConfig.revenue.color }} />
              <span>Revenue: KES {totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartConfig.expenses.color }} />
              <span>Expenses: KES {totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickFormatter={(value) => `KES ${(value / 1000)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            <Bar 
              dataKey="revenue" 
              fill="var(--color-revenue)" 
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
            <Bar 
              dataKey="expenses" 
              fill="var(--color-expenses)" 
              radius={[4, 4, 0, 0]}
              name="Expenses"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}