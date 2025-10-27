'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MoreHorizontal,
  ArrowUpDown,
  PlusCircle,
} from 'lucide-react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { products as initialProducts, Product } from '@/lib/merchandise';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '../ui/badge';

const columns: ColumnDef<Product>[] = [
    {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Image 
                    src={row.original.imageUrl}
                    alt={row.original.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                />
                <div>
                    <div className="font-medium">{row.original.name}</div>
                </div>
            </div>
        )
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => <Badge variant="outline">{row.getValue('category')}</Badge>
    },
    {
        accessorKey: 'price',
        header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('price'))
            const formatted = new Intl.NumberFormat('en-KE', {
              style: 'currency',
              currency: 'KES',
            }).format(amount)
       
            return <div className="pl-4 font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: 'sizes',
        header: 'Sizes',
        cell: ({ row }) => {
            const sizes = row.getValue('sizes') as string[] | undefined;
            if (!sizes || sizes.length === 0) {
                return <span className="text-muted-foreground">N/A</span>;
            }
            return (
                <div className="flex flex-wrap gap-1">
                    {sizes.map(size => <Badge key={size} variant="secondary">{size}</Badge>)}
                </div>
            )
        }
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
                <DropdownMenuItem>Edit Product</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete Product</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];

export function ProductManagementTable() {
  const [data] = React.useState(() => [...initialProducts]);
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
    <Card>
        <CardContent className="p-4">
            <div className="flex items-center justify-end py-4">
                <Button asChild>
                    <Link href="/merchandise/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
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
                        No products found.
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
