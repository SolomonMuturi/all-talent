'use client';

import * as React from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  PlusCircle,
  Search,
  QrCode,
  Wrench,
} from 'lucide-react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { equipment, type Equipment } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../ui/tooltip';

const getStatusVariant = (status: Equipment['status']) => {
    switch (status) {
        case 'In Use':
            return 'default';
        case 'In Storage':
            return 'secondary';
        case 'Maintenance':
            return 'destructive';
        default:
            return 'outline';
    }
};

const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Item Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
     cell: ({ row }) => (
      <div className="flex items-center gap-2">
         <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <QrCode className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>QR Code: {row.original.id}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => row.getValue('assignedTo') || <span className="text-muted-foreground">N/A</span>
  },
  {
    accessorKey: 'location',
    header: 'Location',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Equipment['status'];
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
  },
  {
      accessorKey: 'maintenanceDue',
      header: 'Next Maintenance',
      cell: ({ row }) => {
          const maintenanceDue = row.getValue('maintenanceDue');
          if (!maintenanceDue) return <span className="text-muted-foreground">N/A</span>;
          return (
            <div className="flex items-center gap-2 text-destructive">
                <Wrench className="h-4 w-4" />
                {new Date(maintenanceDue as string).toLocaleDateString()}
            </div>
          )
      }
  }
];

export function EquipmentTable() {
  const [data] = React.useState(() => [...equipment]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Equipment Inventory</CardTitle>
            <CardDescription>Track all high-value academy assets.</CardDescription>
        </CardHeader>
      <CardContent className="p-4">
      <div className="flex items-center py-4 gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by item name..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      </CardContent>
    </Card>
  );
}
