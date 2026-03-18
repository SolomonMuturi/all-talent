'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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
import { Button } from '../ui/button';

const chartConfig = {
  players: {
    label: 'Players',
  },
};

export function PlayerDistributionChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      setLoading(true);
      try {
        const res = await fetch('/api/players?limit=1000');
        const result = await res.json();
        if (result.success && Array.isArray(result.data?.players)) {
          // Count players per team
          const teamCounts: Record<string, number> = {};
          result.data.players.forEach((player: any) => {
            const team = player.team || 'Unassigned';
            teamCounts[team] = (teamCounts[team] || 0) + 1;
          });
          const colors = [
            'hsl(var(--chart-1))',
            'hsl(var(--chart-2))',
            'hsl(var(--chart-3))',
            'hsl(var(--chart-4))',
            'hsl(var(--chart-5))',
            'hsl(var(--chart-6))',
          ];
          setData(
            Object.entries(teamCounts).map(([team, count], idx) => ({
              name: team,
              value: count,
              fill: colors[idx % colors.length],
            }))
          );
        } else {
          setData([]);
        }
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
            <CardTitle className="font-headline">Player Distribution</CardTitle>
            <CardDescription>Number of players per team</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
          <Link href="/players">
            View breakdown
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height={280}>
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
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
