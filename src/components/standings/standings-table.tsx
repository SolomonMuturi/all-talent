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
import { ArrowUpDown, Trophy } from 'lucide-react';
import Link from 'next/link';

const playerColumns: ColumnDef<Player>[] = [
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

function PlayerStandingsTable({ teamName, players }: { teamName: string; players: Player[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'points', desc: true },
  ]);

  const table = useReactTable({
    data: players,
    columns: playerColumns,
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
        <CardTitle className="font-headline">{teamName} - Player Standings</CardTitle>
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
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        <Link href={`/players/${row.original.id}`} className="block w-full h-full">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </Link>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={playerColumns.length} className="h-24 text-center">
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


export function StandingsTable({ playersByTeam }: { playersByTeam: Record<string, Player[]>}) {
    return (
        <div className="space-y-8">
            <h2 className="text-xl font-semibold tracking-tight font-headline">Individual Player Standings</h2>
            {Object.entries(playersByTeam).map(([teamName, teamPlayers]) => (
                <PlayerStandingsTable key={teamName} teamName={teamName} players={teamPlayers} />
            ))}
        </div>
    )
}

type TeamStats = {
    name: string;
    points: number;
    played: number;
    wins: number;
    draws: number;
    losses: number;
}

const teamColumns: ColumnDef<TeamStats>[] = [
  {
    id: 'rank',
    header: 'Rank',
    cell: ({ row }) => <div className="pl-4 font-bold flex items-center gap-2">
      <Trophy className={`size-5 ${row.index === 0 ? 'text-yellow-400' : 'text-muted-foreground'}`}/>
      {row.index + 1}
      </div>,
  },
  {
    accessorKey: 'name',
    header: 'Team',
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: 'played',
    header: () => <div className="text-center">Played</div>,
    cell: ({ row }) => <div className="text-center">{row.original.played}</div>,
  },
    {
    accessorKey: 'wins',
    header: () => <div className="text-center">W</div>,
    cell: ({ row }) => <div className="text-center">{row.original.wins}</div>,
  },
  {
    accessorKey: 'draws',
    header: () => <div className="text-center">D</div>,
    cell: ({ row }) => <div className="text-center">{row.original.draws}</div>,
  },
  {
    accessorKey: 'losses',
    header: () => <div className="text-center">L</div>,
    cell: ({ row }) => <div className="text-center">{row.original.losses}</div>,
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


export function TeamStandingsTable({ teams }: { teams: TeamStats[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'points', desc: true },
  ]);

  const table = useReactTable({
    data: teams,
    columns: teamColumns,
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
        <CardTitle className="font-headline">Overall Team Standings</CardTitle>
        <CardDescription>League table ranking teams based on aggregate player points.</CardDescription>
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
                  <TableCell colSpan={teamColumns.length} className="h-24 text-center">
                    No teams found.
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
