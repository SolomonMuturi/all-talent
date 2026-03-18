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
import { useEffect, useState } from 'react';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Types
type Equipment = {
  id: string | number;
  name: string;
  category: string;
  assignedTo?: string;
  location: string;
  status: 'In Use' | 'In Storage' | 'Maintenance';
  maintenanceDue?: string;
  description?: string;
  serialNumber?: string;
  purchaseDate?: string;
  value?: number;
  createdAt?: string;
  updatedAt?: string;
};

// Add Equipment Form Component
function AddEquipmentForm({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void; 
  onSuccess: (equipment: Equipment) => void 
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    assignedTo: '',
    location: '',
    status: 'In Storage' as Equipment['status'],
    maintenanceDue: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Submitting form data:', formData);
      
      // Prepare data for API - only send fields that are filled
      const requestData: any = {
        name: formData.name.trim(),
        category: formData.category,
        location: formData.location.trim(),
        status: formData.status,
      };

      // Only include optional fields if they have values
      if (formData.assignedTo.trim()) {
        requestData.assignedTo = formData.assignedTo.trim();
      }

      if (formData.maintenanceDue) {
        requestData.maintenanceDue = formData.maintenanceDue;
      }

      if (formData.description.trim()) {
        requestData.description = formData.description.trim();
      }

      console.log('Sending to API:', requestData);
      
      // Send to API
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        toast.success('Equipment added successfully!');
        onSuccess(result.data.equipment);
        onClose();
      } else {
        const errorMsg = result.error || 'Failed to add equipment';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error('Error adding equipment:', err);
      setError(err.message || 'Network error. Please try again.');
      toast.error(err.message || 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter item name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Vehicles">Vehicles</SelectItem>
                <SelectItem value="Safety">Safety Equipment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Equipment['status']) => handleChange('status', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Use">In Use</SelectItem>
                <SelectItem value="In Storage">In Storage</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Room 101, Warehouse A"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input
              id="assignedTo"
              value={formData.assignedTo}
              onChange={(e) => handleChange('assignedTo', e.target.value)}
              placeholder="Person or department"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenanceDue">Next Maintenance</Label>
            <Input
              id="maintenanceDue"
              type="date"
              value={formData.maintenanceDue}
              onChange={(e) => handleChange('maintenanceDue', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Equipment description, specifications, etc."
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Adding...
            </>
          ) : (
            'Add Equipment'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

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
        <div className="font-medium">{row.getValue('name')}</div>
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue('category')}</span>
    ),
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: ({ row }) => {
      const assignedTo = row.getValue('assignedTo');
      return assignedTo ? (
        <span>{assignedTo as string}</span>
      ) : (
        <span className="text-muted-foreground italic">N/A</span>
      );
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('location')}</span>
    ),
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
          if (!maintenanceDue) return <span className="text-muted-foreground italic">N/A</span>;
          
          try {
            const dueDate = new Date(maintenanceDue as string);
            const today = new Date();
            const isOverdue = dueDate < today;
            
            return (
              <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive' : 'text-amber-600'}`}>
                  <Wrench className="h-4 w-4" />
                  <span className={isOverdue ? 'font-semibold' : ''}>
                    {dueDate.toLocaleDateString()}
                    {isOverdue && ' (Overdue)'}
                  </span>
              </div>
            );
          } catch {
            return <span className="text-muted-foreground">Invalid date</span>;
          }
      }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const equipment = row.original;
      
      return (
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Edit functionality
                    console.log('Edit equipment:', equipment.id);
                  }}
                >
                  Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit equipment details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  }
];

export function EquipmentTable({ equipment: propEquipment }: { equipment?: Equipment[] }) {
  const [equipment, setEquipment] = useState<Equipment[]>(propEquipment || []);
  const [loading, setLoading] = useState(!propEquipment);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Fetch equipment data
  useEffect(() => {
    if (propEquipment) {
      setEquipment(propEquipment);
      setLoading(false);
      return;
    }
    
    const fetchEquipment = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching equipment data...');
        const response = await fetch('/api/equipment');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Equipment data received:', data);
        
        if (data.success) {
          // Ensure all equipment items have the required fields
          const processedEquipment = (data.data.equipment || []).map((item: any) => ({
            id: item.id || `EQP-${Date.now()}`,
            name: item.name || 'Unnamed Item',
            category: item.category || 'Uncategorized',
            assignedTo: item.assignedTo || '',
            location: item.location || 'Unknown',
            status: (item.status || 'In Storage') as Equipment['status'],
            maintenanceDue: item.maintenanceDue || '',
            description: item.description || '',
            serialNumber: item.serialNumber || '',
            purchaseDate: item.purchaseDate || '',
            value: item.value || 0,
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || '',
          }));
          
          setEquipment(processedEquipment);
        } else {
          setError(data.error || 'Failed to load equipment');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [propEquipment, refetchTrigger]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data: equipment,
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

  const handleAddEquipment = (newEquipment: Equipment) => {
    // Add the new equipment to the beginning of the list
    setEquipment(prev => [newEquipment, ...prev]);
    
    // Trigger a refetch to ensure data consistency
    setRefetchTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="text-center">
              <p className="font-medium">Loading equipment...</p>
              <p className="text-sm text-muted-foreground">Please wait while we fetch your inventory</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <p className="font-semibold text-destructive">Error Loading Equipment</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
              >
                Retry
              </Button>
              <Button 
                variant="default"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">Equipment Inventory</CardTitle>
              <CardDescription>Track all high-value academy assets.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <span className="text-sm">⟳</span>
              Refresh
            </Button>
          </div>
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
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Equipment</DialogTitle>
                    <DialogDescription>
                      Add new equipment to the inventory. Fields marked with * are required.
                    </DialogDescription>
                  </DialogHeader>
                  <AddEquipmentForm 
                    onClose={() => setIsAddDialogOpen(false)}
                    onSuccess={handleAddEquipment}
                  />
                </DialogContent>
              </Dialog>
              
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
                        {column.id === 'assignedTo' ? 'Assigned To' : 
                         column.id === 'maintenanceDue' ? 'Next Maintenance' :
                         column.id}
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
                    <TableRow 
                      key={row.id} 
                      data-state={row.getIsSelected() && "selected"}
                      className="hover:bg-muted/50 transition-colors"
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
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <PlusCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">No equipment found</p>
                          <p className="text-sm text-muted-foreground">
                            Get started by adding your first item
                          </p>
                        </div>
                        <Button
                          onClick={() => setIsAddDialogOpen(true)}
                          className="mt-2"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Equipment
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {table.getRowModel().rows?.length > 0 && (
            <div className="flex items-center justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> item(s)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <div className="text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}