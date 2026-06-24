'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MoreHorizontal,
  ArrowUpDown,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  ShoppingCart,
  PackagePlus,
} from 'lucide-react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  sales: number;
  image?: string;
  imageUrl?: string;
  description?: string;
  sizes?: string[];
};

const getStatusVariant = (stock: number, threshold: number): 'default' | 'secondary' | 'destructive' => {
  if (stock <= 0) return 'destructive';
  if (stock < threshold) return 'secondary';
  return 'default';
};

const getStatusText = (stock: number, threshold: number): string => {
  if (stock <= 0) return 'Out of Stock';
  if (stock < threshold) return 'Low Stock';
  return 'In Stock';
};

export function ProductManagementTable() {
  const { toast } = useToast();
  const [data, setData] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [sellDialogOpen, setSellDialogOpen] = React.useState(false);
  const [restockDialogOpen, setRestockDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  
  // Form states
  const [editForm, setEditForm] = React.useState<Partial<Product>>({});
  const [sellQuantity, setSellQuantity] = React.useState(1);
  const [restockQuantity, setRestockQuantity] = React.useState(10);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/merchandise');
      if (!res.ok) throw new Error('Failed to fetch products');
      const result = await res.json();
      const products = (result.data?.products || []).map((p: any) => ({
        ...p,
        image: p.image || p.imageUrl || '',
        imageUrl: p.imageUrl || p.image || '',
        sizes: Array.isArray(p.sizes) ? p.sizes : 
               typeof p.sizes === 'string' ? JSON.parse(p.sizes) : [],
      }));
      setData(products);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  // View Product
  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  // Edit Product
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
    });
    setEditDialogOpen(true);
  };

  // Sell Product
  const handleSell = (product: Product) => {
    setSelectedProduct(product);
    setSellQuantity(1);
    setSellDialogOpen(true);
  };

  // Restock Product
  const handleRestock = (product: Product) => {
    setSelectedProduct(product);
    setRestockQuantity(10);
    setRestockDialogOpen(true);
  };

  // Delete Product
  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/merchandise?id=${selectedProduct.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete product');
      
      toast({
        title: 'Product Deleted',
        description: `${selectedProduct.name} has been removed.`,
        variant: 'default',
      });
      
      setDeleteDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Edit
  const confirmEdit = async () => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id', selectedProduct.id);
      formData.append('name', editForm.name || '');
      formData.append('price', String(editForm.price || 0));
      formData.append('category', editForm.category || '');
      formData.append('description', editForm.description || '');
      formData.append('stock', String(editForm.stock || 0));
      formData.append('lowStockThreshold', String(editForm.lowStockThreshold || 5));
      formData.append('sizes', editForm.sizes || '');
      formData.append('existingImage', selectedProduct.image || '');

      const res = await fetch('/api/merchandise', {
        method: 'PUT',
        body: formData,
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update product');
      
      toast({
        title: 'Product Updated',
        description: `${editForm.name} has been updated successfully.`,
        variant: 'default',
      });
      
      setEditDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Sell
  const confirmSell = async () => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    try {
      const newStock = selectedProduct.stock - sellQuantity;
      if (newStock < 0) {
        toast({
          title: 'Insufficient Stock',
          description: `Only ${selectedProduct.stock} units available.`,
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('id', selectedProduct.id);
      formData.append('name', selectedProduct.name);
      formData.append('price', String(selectedProduct.price));
      formData.append('category', selectedProduct.category);
      formData.append('description', selectedProduct.description || '');
      formData.append('stock', String(newStock));
      formData.append('sales', String((selectedProduct.sales || 0) + sellQuantity));
      formData.append('lowStockThreshold', String(selectedProduct.lowStockThreshold));
      formData.append('sizes', Array.isArray(selectedProduct.sizes) ? selectedProduct.sizes.join(', ') : '');
      formData.append('existingImage', selectedProduct.image || '');

      const res = await fetch('/api/merchandise', {
        method: 'PUT',
        body: formData,
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to process sale');
      
      toast({
        title: 'Sale Recorded',
        description: `${sellQuantity} unit(s) of ${selectedProduct.name} sold.`,
        variant: 'default',
      });
      
      setSellDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process sale',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Restock
  const confirmRestock = async () => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    try {
      const newStock = selectedProduct.stock + restockQuantity;

      const formData = new FormData();
      formData.append('id', selectedProduct.id);
      formData.append('name', selectedProduct.name);
      formData.append('price', String(selectedProduct.price));
      formData.append('category', selectedProduct.category);
      formData.append('description', selectedProduct.description || '');
      formData.append('stock', String(newStock));
      formData.append('sales', String(selectedProduct.sales || 0));
      formData.append('lowStockThreshold', String(selectedProduct.lowStockThreshold));
      formData.append('sizes', Array.isArray(selectedProduct.sizes) ? selectedProduct.sizes.join(', ') : '');
      formData.append('existingImage', selectedProduct.image || '');

      const res = await fetch('/api/merchandise', {
        method: 'PUT',
        body: formData,
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to restock');
      
      toast({
        title: 'Stock Added',
        description: `Added ${restockQuantity} unit(s) to ${selectedProduct.name}. New stock: ${newStock}`,
        variant: 'default',
      });
      
      setRestockDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to restock product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => {
        const product = row.original;
        const [imageError, setImageError] = React.useState(false);
        const imageUrl = product.image || product.imageUrl || '';
        
        return (
          <div className="flex items-center gap-3">
            {imageUrl && !imageError ? (
              <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                  unoptimized={true}
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-muted-foreground">No</span>
              </div>
            )}
            <div>
              <div className="font-medium">{product.name}</div>
              {product.description && (
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {product.description}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <Badge variant="outline">{row.getValue('category') || 'N/A'}</Badge>
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
        const amount = parseFloat(row.getValue('price'));
        const formatted = new Intl.NumberFormat('en-KE', {
          style: 'currency',
          currency: 'KES',
        }).format(amount);

        return <div className="pl-4 font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'stock',
      header: () => <div className="text-center">Stock</div>,
      cell: ({ row }) => <div className="text-center">{row.getValue('stock')}</div>
    },
    {
      accessorKey: 'sales',
      header: () => <div className="text-center">Sales</div>,
      cell: ({ row }) => <div className="text-center">{row.getValue('sales') || 0}</div>
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const { stock, lowStockThreshold } = row.original;
        return (
          <Badge variant={getStatusVariant(stock, lowStockThreshold || 5)}>
            {getStatusText(stock, lowStockThreshold || 5)}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;
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
                <DropdownMenuItem onClick={() => handleView(product)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSell(product)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Sell Product
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRestock(product)}>
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Restock / Add Stock
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(product)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              {data.length} product(s) available
            </div>
            <Button asChild>
              <Link href="/merchandise/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
          <div className="rounded-md border overflow-x-auto">
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

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Complete information about this product.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name</Label>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="font-medium">{selectedProduct.category || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Price</Label>
                  <p className="font-medium">KES {selectedProduct.price.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Stock</Label>
                  <p className="font-medium">{selectedProduct.stock}</p>
                </div>
                <div>
                  <Label>Sales</Label>
                  <p className="font-medium">{selectedProduct.sales || 0}</p>
                </div>
              </div>
              {selectedProduct.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                </div>
              )}
              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div>
                  <Label>Available Sizes</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedProduct.sizes.map((size) => (
                      <Badge key={size} variant="outline">{size}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label>Status</Label>
                <Badge variant={getStatusVariant(selectedProduct.stock, selectedProduct.lowStockThreshold || 5)}>
                  {getStatusText(selectedProduct.stock, selectedProduct.lowStockThreshold || 5)}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Input
                  id="edit-category"
                  value={editForm.category || ''}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (KES) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.price || 0}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editForm.stock || 0}
                  onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-threshold">Low Stock Threshold</Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={editForm.lowStockThreshold || 5}
                  onChange={(e) => setEditForm({ ...editForm, lowStockThreshold: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-sizes">Sizes (comma separated)</Label>
              <Input
                id="edit-sizes"
                placeholder="e.g., S, M, L, XL"
                value={editForm.sizes || ''}
                onChange={(e) => setEditForm({ ...editForm, sizes: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sell Product</DialogTitle>
            <DialogDescription>
              Record a sale for this product.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>Product</Label>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              <div>
                <Label>Price per unit</Label>
                <p className="font-medium">KES {selectedProduct.price.toLocaleString()}</p>
              </div>
              <div>
                <Label>Available Stock</Label>
                <p className="font-medium">{selectedProduct.stock} units</p>
              </div>
              <div>
                <Label htmlFor="sell-quantity">Quantity to Sell *</Label>
                <Input
                  id="sell-quantity"
                  type="number"
                  min={1}
                  max={selectedProduct.stock}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(Math.max(1, Number(e.target.value)))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max: {selectedProduct.stock} units
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <Label>Total Revenue</Label>
                <p className="text-lg font-bold text-primary">
                  KES {(selectedProduct.price * sellQuantity).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSellDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmSell} disabled={isSubmitting || !selectedProduct || selectedProduct.stock === 0}>
              {isSubmitting ? 'Processing...' : 'Confirm Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock / Add Stock</DialogTitle>
            <DialogDescription>
              Add more stock to this product.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div>
                <Label>Product</Label>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              <div>
                <Label>Current Stock</Label>
                <p className="font-medium">{selectedProduct.stock} units</p>
              </div>
              <div>
                <Label htmlFor="restock-quantity">Quantity to Add *</Label>
                <Input
                  id="restock-quantity"
                  type="number"
                  min={1}
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(Math.max(1, Number(e.target.value)))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be added to the current stock.
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <Label>New Stock After Restock</Label>
                <p className="text-lg font-bold text-primary">
                  {selectedProduct.stock + restockQuantity} units
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmRestock} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Stock'}
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
              <span className="font-semibold">{selectedProduct?.name}</span> from the merchandise store.
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