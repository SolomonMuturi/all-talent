'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { AcademyEvent } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import Image from 'next/image';

const columns: ColumnDef<AcademyEvent>[] = [
  {
    accessorKey: 'title',
    header: 'Event',
    cell: ({ row }) => (
        <div className="flex items-center gap-3">
            <Image 
                src={row.original.logoUrl}
                alt={row.original.title}
                width={40}
                height={40}
                className="rounded-md object-contain"
            />
            <div>
                <div className="font-medium">{row.original.title}</div>
                <div className="text-xs text-muted-foreground">{row.original.subtitle}</div>
            </div>
        </div>
    )
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
  {
    accessorKey: 'organizer',
    header: 'Organizer',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('category')}</Badge>
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="text-right">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Edit Event</DropdownMenuItem>
                <DropdownMenuItem>View Analytics</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete Event</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];

interface EventManagementTableProps {
    events: AcademyEvent[];
}

export function EventManagementTable({ events }: EventManagementTableProps) {
  const [data] = React.useState(() => [...events]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Card className="mt-6">
        <CardHeader>
            <CardTitle>Your Events</CardTitle>
            <CardDescription>A list of all events you have created.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                            {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                        ))}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
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
                        No events found.
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
