'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  PlusCircle,
  Search,
  FilePlus2,
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
import { Card, CardContent } from '@/components/ui/card';

interface Transaction {
  id: string;
  player_name: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  type: 'Fee Payment' | 'Stipend' | 'Expense' | 'Refund';
  description: string | null;
  created_at: string;
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'Transaction ID',
  },
  {
    accessorKey: 'player_name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Player/Payee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString(),
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const formatted = new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
      }).format(amount);
      return <div className={`text-right font-medium ${amount < 0 ? 'text-destructive' : ''}`}>{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
      if (status === 'Completed') variant = 'default';
      if (status === 'Failed') variant = 'destructive';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
];

export function TransactionsTable() {
  const [data, setData] = React.useState<Transaction[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/finances/transactions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data.transactions);
      } else {
        setError(result.error || 'Failed to load transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading transactions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
      <div className="flex items-center py-4 gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by player/payee..."
            value={(table.getColumn('playerName')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('playerName')?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>
        <div className="ml-auto flex gap-2">
          <Button asChild>
            <Link href="/finances/pay">
              <PlusCircle className="mr-2 h-4 w-4" />
              Make Payment
            </Link>
          </Button>
           <Button variant="secondary" asChild>
            <Link href="/finances/log-expense">
              <FilePlus2 className="mr-2 h-4 w-4" />
              Log Expense
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
