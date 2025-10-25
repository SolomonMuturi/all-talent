'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { players, type Player } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

const columns: ColumnDef<Player>[] = [
  {
    accessorKey: 'rank',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Rank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="pl-4 font-bold">#{row.original.rank}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Player',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={row.original.avatarUrl} alt={row.original.name} />
          <AvatarFallback>{row.original.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'stats.played',
    header: () => <div className="text-center">Played</div>,
    cell: ({ row }) => <div className="text-center">{row.original.stats.played}</div>,
  },
  {
    accessorKey: 'stats.wins',
    header: () => <div className="text-center">W</div>,
    cell: ({ row }) => <div className="text-center">{row.original.stats.wins}</div>,
  },
  {
    accessorKey: 'stats.draws',
    header: () => <div className="text-center">D</div>,
    cell: ({ row }) => <div className="text-center">{row.original.stats.draws}</div>,
  },
  {
    accessorKey: 'stats.losses',
    header: () => <div className="text-center">L</div>,
    cell: ({ row }) => <div className="text-center">{row.original.stats.losses}</div>,
  },
  {
    accessorKey: 'points',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="w-full justify-center"
          >
            Points
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => <div className="text-center font-bold text-lg text-primary">{row.original.points}</div>,
  },
];

function TeamStandingsTable({ teamName, players }: { teamName: string; players: Player[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'points', desc: true },
  ]);

  const table = useReactTable({
    data: players,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{teamName} Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No players in this team.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


export function StandingsTable() {
    const playersByTeam = players.reduce((acc, player) => {
        const team = player.team;
        if (!acc[team]) {
          acc[team] = [];
        }
        acc[team].push(player);
        return acc;
      }, {} as Record<string, Player[]>);

    return (
        <div className="space-y-8">
            {Object.entries(playersByTeam).map(([teamName, teamPlayers]) => (
                <TeamStandingsTable key={teamName} teamName={teamName} players={teamPlayers} />
            ))}
        </div>
    )
}
