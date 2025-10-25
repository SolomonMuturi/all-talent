'use client';

import * as React from 'react';
import { teamMembers as initialTeamMembers, type TeamMember } from '@/lib/data';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function TeamTable() {
  const [data, setData] = React.useState(initialTeamMembers);

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: 'name',
      header: 'Staff Member',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.original.avatarUrl} alt={row.original.name} data-ai-hint="professional portrait"/>
            <AvatarFallback>{row.original.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
    },
    {
      accessorKey: 'hoursWorked',
      header: () => <div className="text-right">Hours Worked</div>,
      cell: ({ row }) => <div className="text-right">{row.original.hoursWorked} hrs</div>,
    },
    {
      accessorKey: 'hourlyRate',
      header: () => <div className="text-right">Rate (KES/hr)</div>,
      cell: ({ row }) => {
        const formatted = new Intl.NumberFormat('en-KE').format(row.original.hourlyRate);
        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      id: 'calculatedWage',
      header: () => <div className="text-right">Calculated Wage (KES)</div>,
      cell: ({ row }) => {
        const wage = row.original.hoursWorked * row.original.hourlyRate;
        const formatted = new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
        }).format(wage);
        return <div className="text-right font-bold text-primary">{formatted}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Team Members</CardTitle>
        <div className="flex justify-between items-center">
        <CardDescription>
          Invite and manage roles for your academy staff.
        </CardDescription>
        <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Employee
        </Button>
        </div>
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
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No team members found.
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
