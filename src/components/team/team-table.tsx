'use client';

import * as React from 'react';
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
import { MoreHorizontal, PlusCircle, Edit, Trash2, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '@/hooks/use-toast';

type TeamMember = {
  id: number | string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  hourly_rate: number;
  hours_worked: number;
  phone: string | null;
  department: string | null;
  join_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export function TeamTable() {
  const { toast } = useToast();
  const [data, setData] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    department: '',
    hourly_rate: '',
    hours_worked: '',
    status: 'active',
  });

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/academy-operations?type=team');
      if (!res.ok) throw new Error('Failed to fetch team members');
      const json = await res.json();
      // The API might return data differently, adapt to your schema
      const team = (json.data?.team || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        avatar_url: m.avatar_url || '',
        hourly_rate: m.hourly_rate || 0,
        hours_worked: m.hours_worked || 0,
        phone: m.phone || null,
        department: m.department || null,
        join_date: m.join_date || null,
        status: m.status || 'active',
        created_at: m.created_at,
        updated_at: m.updated_at,
      }));
      setData(team);
    } catch (err: any) {
      setError(err.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTeam();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      phone: '',
      department: '',
      hourly_rate: '',
      hours_worked: '',
      status: 'active',
    });
  };

  // Handle Add Employee
  const handleAddEmployee = () => {
    resetForm();
    setAddDialogOpen(true);
  };

  const confirmAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/academy-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'team',
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || null,
          department: formData.department || null,
          hourly_rate: Number(formData.hourly_rate) || 0,
          hours_worked: Number(formData.hours_worked) || 0,
          status: formData.status || 'active',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to add team member');

      toast({
        title: 'Employee Added',
        description: `${formData.name} has been added to the team.`,
        variant: 'default',
      });

      setAddDialogOpen(false);
      resetForm();
      fetchTeam();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add employee',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit
  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone || '',
      department: member.department || '',
      hourly_rate: String(member.hourly_rate || 0),
      hours_worked: String(member.hours_worked || 0),
      status: member.status || 'active',
    });
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedMember) return;
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/academy-operations?id=${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'team',
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone || null,
          department: formData.department || null,
          hourly_rate: Number(formData.hourly_rate) || 0,
          hours_worked: Number(formData.hours_worked) || 0,
          status: formData.status || 'active',
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update team member');

      toast({
        title: 'Employee Updated',
        description: `${formData.name}'s information has been updated.`,
        variant: 'default',
      });

      setEditDialogOpen(false);
      resetForm();
      fetchTeam();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employee',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/academy-operations?id=${selectedMember.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'team' }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete team member');

      toast({
        title: 'Employee Removed',
        description: `${selectedMember.name} has been removed from the team.`,
        variant: 'default',
      });

      setDeleteDialogOpen(false);
      fetchTeam();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete employee',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: 'name',
      header: 'Staff Member',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={row.original.avatar_url} alt={row.original.name} />
            <AvatarFallback>{row.original.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="grid gap-0.5">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.email}</span>
            {row.original.phone && (
              <span className="text-xs text-muted-foreground">{row.original.phone}</span>
            )}
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
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => row.original.department || 'N/A',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'hours_worked',
      header: () => <div className="text-right">Hours Worked</div>,
      cell: ({ row }) => <div className="text-right">{row.original.hours_worked} hrs</div>,
    },
    {
      accessorKey: 'hourly_rate',
      header: () => <div className="text-right">Rate (KES/hr)</div>,
      cell: ({ row }) => {
        const formatted = new Intl.NumberFormat('en-KE').format(row.original.hourly_rate);
        return <div className="text-right">{formatted}</div>;
      },
    },
    {
      id: 'calculated_wage',
      header: () => <div className="text-right">Calculated Wage (KES)</div>,
      cell: ({ row }) => {
        const wage = row.original.hours_worked * row.original.hourly_rate;
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
              <DropdownMenuItem onClick={() => handleEdit(member)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(member)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
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
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline">Team Members</CardTitle>
              <CardDescription>
                Invite and manage roles for your academy staff.
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddEmployee}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Loading team members...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchTeam}>
                Retry
              </Button>
            </div>
          ) : (
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
                        No team members found. Click "Add Employee" to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>
              Add a new team member to your academy staff.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-name">Full Name *</Label>
                <Input
                  id="add-name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="add-email">Email *</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="john@academy.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="add-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coach">Coach</SelectItem>
                    <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                    <SelectItem value="Head Coach">Head Coach</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Trainer">Trainer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-department">Department</Label>
                <Input
                  id="add-department"
                  placeholder="e.g., Coaching, Administration"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  placeholder="+254 700 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="add-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="add-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="add-rate">Hourly Rate (KES)</Label>
                <Input
                  id="add-rate"
                  type="number"
                  placeholder="500"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="add-hours">Hours Worked</Label>
                <Input
                  id="add-hours"
                  type="number"
                  placeholder="40"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddEmployee} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the team member's information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Coach">Coach</SelectItem>
                    <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                    <SelectItem value="Head Coach">Head Coach</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Trainer">Trainer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-rate">Hourly Rate (KES)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-hours">Hours Worked</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  value={formData.hours_worked}
                  onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEdit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-semibold">{selectedMember?.name}</span> from the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}