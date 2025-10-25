'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';

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

const chartData = [
  { month: 'Jan', revenue: 186000, expenses: 145000 },
  { month: 'Feb', revenue: 305000, expenses: 210000 },
  { month: 'Mar', revenue: 237000, expenses: 190000 },
  { month: 'Apr', revenue: 173000, expenses: 130000 },
  { month: 'May', revenue: 209000, expenses: 160000 },
  { month: 'Jun', revenue: 214000, expenses: 175000 },
  { month: 'Jul', revenue: 325000, expenses: 230000 },
];

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

export function RevenueVsExpenseChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Revenue vs. Expenses</CardTitle>
        <CardDescription>January - July 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
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
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
