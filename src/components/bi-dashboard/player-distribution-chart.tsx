'use client';

import * as React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer
} from '@/components/ui/chart';

const data = [
  { name: 'U-15', value: 45, fill: 'hsl(var(--chart-1))' },
  { name: 'U-17', value: 62, fill: 'hsl(var(--chart-2))' },
  { name: 'U-19', value: 45, fill: 'hsl(var(--chart-3))' },
];

const chartConfig = {
  players: {
    label: 'Players',
  },
};

export function PlayerDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Player Distribution</CardTitle>
        <CardDescription>Number of players per team</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <PieChart>
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-2 text-sm bg-background/80 rounded-md border backdrop-blur-sm">
                      <p className="font-medium">{`${payload[0].name}: ${payload[0].value} players`}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
