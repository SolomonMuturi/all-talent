'use client';

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import { teamMembers, type TeamMember } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const columns: ColumnDef<TeamMember>[] = [
    {
        accessorKey: 'name',
        header: 'Staff Member',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={row.original.avatarUrl} alt={row.original.name} />
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
        }
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
];

export function PayrollTable() {
    const table = useReactTable({
        data: teamMembers,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Card>
            <CardContent className="p-4">
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