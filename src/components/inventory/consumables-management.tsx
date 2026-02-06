// app/components/consumables-management.tsx
'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, AlertCircle, Plus, RefreshCw, X, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface Consumable {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  minOrderQuantity: number;
  pricePerUnit: number;
  supplier?: string;
  lastRestocked?: string;
  nextRestockDate?: string;
  location: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  needsRestock: boolean;
  progress: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PurchaseOrder {
  id: string;
  items: Array<{
    consumableId: number;
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
  }>;
  totalAmount: number;
  supplier: string;
  notes: string;
  status: 'pending' | 'ordered' | 'delivered';
  createdAt: Date;
}

interface NewConsumableFormData {
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  minOrderQuantity: number;
  pricePerUnit: number;
  supplier?: string;
  location: string;
  notes?: string;
}

const CATEGORIES = [
  'Beverages',
  'Snacks',
  'Medical Supplies',
  'Sports Equipment',
  'Office Supplies',
  'Cleaning Supplies',
  'Supplements',
  'Other'
];

const UNITS = [
  'bottles',
  'cans',
  'packs',
  'boxes',
  'units',
  'pairs',
  'liters',
  'kilograms',
  'meters',
  'rolls',
  'tubes',
  'bags'
];

const LOCATIONS = [
  'Storage Room A',
  'Storage Room B',
  'Storage Room C',
  'First Aid Room',
  'Kitchen',
  'Locker Room',
  'Office'
];

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'In Stock':
      return 'default';
    case 'Low Stock':
      return 'secondary';
    case 'Out of Stock':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function ConsumablesManagement() {
  // State management
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [supplier, setSupplier] = useState('Sports Supply Co.');
  const [notes, setNotes] = useState('Restock for upcoming U-19 tournament');
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Consumable | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  
  // Add item form state
  const [newConsumable, setNewConsumable] = useState<NewConsumableFormData>({
    name: '',
    category: 'Beverages',
    unit: 'bottles',
    currentStock: 0,
    lowStockThreshold: 10,
    minOrderQuantity: 5,
    pricePerUnit: 0,
    supplier: '',
    location: 'Storage Room A',
    notes: ''
  });

  // Initialize with data from API
  useEffect(() => {
    fetchConsumables();
    loadPurchaseOrders();
  }, []);

  const fetchConsumables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/consumables');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch consumables');
      }
      
      if (data.success) {
        setConsumables(data.data.consumables);
        console.log('✅ Fetched consumables from API:', data.data.consumables.length);
      } else {
        throw new Error(data.error || 'Failed to load consumables');
      }
    } catch (err: any) {
      console.error('❌ Fetch consumables error:', err.message);
      setError(err.message);
      toast.error('Failed to load consumables', {
        description: err.message,
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadPurchaseOrders = () => {
    const savedOrders = localStorage.getItem('purchaseOrders');
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        const parsedOrders = orders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
        }));
        setPurchaseOrders(parsedOrders);
      } catch (err) {
        console.error('Error parsing saved purchase orders:', err);
      }
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchConsumables();
  };

  const handleAddConsumable = async () => {
    // Validate form
    if (!newConsumable.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (newConsumable.currentStock < 0) {
      toast.error('Current stock cannot be negative');
      return;
    }
    
    if (newConsumable.lowStockThreshold <= 0) {
      toast.error('Low stock threshold must be greater than 0');
      return;
    }
    
    if (newConsumable.minOrderQuantity <= 0) {
      toast.error('Minimum order quantity must be greater than 0');
      return;
    }

    try {
      const response = await fetch('/api/consumables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConsumable),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(', ') || 'Failed to add consumable');
      }
      
      if (data.success) {
        // Add the new consumable to the list
        setConsumables([...consumables, data.data.consumable]);
        
        // Reset form
        setNewConsumable({
          name: '',
          category: 'Beverages',
          unit: 'bottles',
          currentStock: 0,
          lowStockThreshold: 10,
          minOrderQuantity: 5,
          pricePerUnit: 0,
          supplier: '',
          location: 'Storage Room A',
          notes: ''
        });
        
        setIsAddDialogOpen(false);
        
        toast.success('Item added successfully!', {
          description: `${newConsumable.name} has been added to inventory.`,
        });
      } else {
        throw new Error(data.error || 'Failed to add consumable');
      }
    } catch (err: any) {
      toast.error('Failed to add item', {
        description: err.message,
      });
      console.error(err);
    }
  };

  const handleEditConsumable = async () => {
    if (!editingItem) return;

    // Validate
    if (editingItem.currentStock < 0) {
      toast.error('Current stock cannot be negative');
      return;
    }

    try {
      const response = await fetch('/api/consumables', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.errors?.join(', ') || 'Failed to update consumable');
      }
      
      if (data.success) {
        // Update the consumable in the list
        setConsumables(consumables.map(item =>
          item.id === editingItem.id ? data.data.consumable : item
        ));
        
        setIsEditDialogOpen(false);
        setEditingItem(null);
        
        toast.success('Item updated successfully!');
      } else {
        throw new Error(data.error || 'Failed to update consumable');
      }
    } catch (err: any) {
      toast.error('Failed to update item', {
        description: err.message,
      });
      console.error(err);
    }
  };

  const handleDeleteConsumable = async (id: number) => {
    const item = consumables.find(c => c.id === id);
    if (!item) return;

    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/consumables?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete consumable');
      }
      
      if (data.success) {
        setConsumables(consumables.filter(c => c.id !== id));
        toast.success('Item deleted successfully!');
      } else {
        throw new Error(data.error || 'Failed to delete consumable');
      }
    } catch (err: any) {
      toast.error('Failed to delete item', {
        description: err.message,
      });
      console.error(err);
    }
  };

  const handleRestockItem = async (itemId: number) => {
    try {
      const item = consumables.find(c => c.id === itemId);
      if (!item) return;

      const restockQuantity = Math.max(
        item.minOrderQuantity,
        Math.ceil(item.lowStockThreshold * 1.5 - item.currentStock)
      );

      const newStock = item.currentStock + restockQuantity;
      
      const response = await fetch('/api/consumables', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          currentStock: newStock,
          lastRestocked: new Date().toISOString().split('T')[0]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to restock item');
      }
      
      if (data.success) {
        // Update the consumable in the list
        setConsumables(consumables.map(c =>
          c.id === itemId ? data.data.consumable : c
        ));
        
        toast.success("Item restocked successfully", {
          description: `${restockQuantity} ${item.unit} of ${item.name} added to stock.`,
        });
      } else {
        throw new Error(data.error || 'Failed to restock item');
      }
    } catch (err: any) {
      toast.error("Failed to restock item", {
        description: err.message,
      });
      console.error(err);
    }
  };

  const updateStockStatus = async (itemId: number, adjustment: number, type: 'use' | 'restock') => {
    try {
      const item = consumables.find(c => c.id === itemId);
      if (!item) return;

      const newStock = type === 'use' 
        ? Math.max(0, item.currentStock - adjustment)
        : item.currentStock + adjustment;

      const payload: any = {
        id: itemId,
        currentStock: newStock,
      };
      
      if (type === 'restock') {
        payload.lastRestocked = new Date().toISOString().split('T')[0];
      }

      const response = await fetch('/api/consumables', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update stock');
      }
      
      if (data.success) {
        // Update the consumable in the list
        setConsumables(consumables.map(c =>
          c.id === itemId ? data.data.consumable : c
        ));
        
        toast.success(`Stock ${type === 'use' ? 'used' : 'restocked'}`, {
          description: `${adjustment} ${item.unit} ${type === 'use' ? 'removed from' : 'added to'} ${item.name}.`,
        });
      } else {
        throw new Error(data.error || 'Failed to update stock');
      }
    } catch (err: any) {
      toast.error("Failed to update stock", {
        description: err.message,
      });
      console.error(err);
    }
  };

  const calculateOrderQuantities = () => {
    return lowStockItems.map(item => {
      const targetStock = Math.ceil(item.lowStockThreshold * 1.5);
      const quantity = Math.max(targetStock - item.currentStock, item.minOrderQuantity);
      
      return {
        consumableId: item.id,
        name: item.name,
        quantity,
        unit: item.unit,
        pricePerUnit: item.pricePerUnit || 0,
      };
    });
  };

  const calculateTotalAmount = (items: Array<{ quantity: number; pricePerUnit: number }>) => {
    return items.reduce((total, item) => total + (item.quantity * item.pricePerUnit), 0);
  };

  const handleCreatePurchaseOrder = () => {
    if (lowStockItems.length === 0) {
      toast.error("No items to order", {
        description: "All consumables are sufficiently stocked.",
      });
      return;
    }

    const orderItems = calculateOrderQuantities();
    const totalAmount = calculateTotalAmount(orderItems);
    
    const newPurchaseOrder: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      items: orderItems,
      totalAmount,
      supplier,
      notes,
      status: 'pending',
      createdAt: new Date(),
    };

    const updatedOrders = [newPurchaseOrder, ...purchaseOrders];
    setPurchaseOrders(updatedOrders);
    
    // Save to localStorage
    localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
    
    setIsPurchaseDialogOpen(false);
    
    toast.success("Purchase Order Created!", {
      description: `Order #${newPurchaseOrder.id} has been created for $${totalAmount.toFixed(2)}`,
      action: {
        label: "Print Order",
        onClick: () => {
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Purchase Order ${newPurchaseOrder.id}</title>
                  <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #333; }
                    .header { margin-bottom: 30px; }
                    .info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
                    .footer { margin-top: 40px; font-size: 0.9em; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>Purchase Order: ${newPurchaseOrder.id}</h1>
                    <div class="info">
                      <p><strong>Supplier:</strong> ${supplier}</p>
                      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                      <p><strong>Notes:</strong> ${notes}</p>
                    </div>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${orderItems.map(item => `
                        <tr>
                          <td>${item.name}</td>
                          <td>${item.quantity}</td>
                          <td>${item.unit}</td>
                          <td>$${item.pricePerUnit.toFixed(2)}</td>
                          <td>$${(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  <div class="total">
                    <p>Total Amount: $${totalAmount.toFixed(2)}</p>
                  </div>
                  <div class="footer">
                    <p>Generated by AllTalent Academy Inventory System</p>
                    <p>Date: ${new Date().toLocaleString()}</p>
                  </div>
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.print();
          }
        }
      }
    });

    // Reset form
    setSupplier('Sports Supply Co.');
    setNotes('Restock for upcoming U-19 tournament');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter consumables
  const filteredConsumables = consumables.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || item.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const lowStockItems = filteredConsumables.filter(item => item.needsRestock);
  
  const totalInventoryValue = filteredConsumables.reduce(
    (total, item) => total + (item.currentStock * (item.pricePerUnit || 0)), 
    0
  );

  const categories = [...new Set(consumables.map(item => item.category))];
  const locations = [...new Set(consumables.map(item => item.location))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-2xl font-bold">{consumables.length}</h3>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <h3 className="text-2xl font-bold text-amber-600">
                  {consumables.filter(item => item.stockStatus === 'Low Stock').length}
                </h3>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalInventoryValue)}</h3>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <h3 className="text-2xl font-bold text-red-600">
                  {consumables.filter(item => item.stockStatus === 'Out of Stock').length}
                </h3>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="size-5" />
              Consumables Management
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {/* Add Item Dialog */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Consumable Item</DialogTitle>
                    <DialogDescription>
                      Add a new consumable item to your inventory.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name *</Label>
                      <Input
                        id="name"
                        value={newConsumable.name}
                        onChange={(e) => setNewConsumable({...newConsumable, name: e.target.value})}
                        placeholder="e.g., Bottled Water"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={newConsumable.category}
                          onValueChange={(value) => setNewConsumable({...newConsumable, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="unit">Unit *</Label>
                        <Select
                          value={newConsumable.unit}
                          onValueChange={(value) => setNewConsumable({...newConsumable, unit: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map(unit => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentStock">Current Stock *</Label>
                        <Input
                          id="currentStock"
                          type="number"
                          min="0"
                          step="1"
                          value={newConsumable.currentStock}
                          onChange={(e) => setNewConsumable({...newConsumable, currentStock: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lowStockThreshold">Low Stock Threshold *</Label>
                        <Input
                          id="lowStockThreshold"
                          type="number"
                          min="1"
                          step="1"
                          value={newConsumable.lowStockThreshold}
                          onChange={(e) => setNewConsumable({...newConsumable, lowStockThreshold: parseInt(e.target.value) || 1})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="minOrderQuantity">Min Order Qty *</Label>
                        <Input
                          id="minOrderQuantity"
                          type="number"
                          min="1"
                          step="1"
                          value={newConsumable.minOrderQuantity}
                          onChange={(e) => setNewConsumable({...newConsumable, minOrderQuantity: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pricePerUnit">Price Per Unit ($)</Label>
                        <Input
                          id="pricePerUnit"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newConsumable.pricePerUnit}
                          onChange={(e) => setNewConsumable({...newConsumable, pricePerUnit: parseFloat(e.target.value) || 0})}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Select
                          value={newConsumable.location}
                          onValueChange={(value) => setNewConsumable({...newConsumable, location: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LOCATIONS.map(location => (
                              <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input
                        id="supplier"
                        value={newConsumable.supplier || ''}
                        onChange={(e) => setNewConsumable({...newConsumable, supplier: e.target.value})}
                        placeholder="Supplier name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newConsumable.notes || ''}
                        onChange={(e) => setNewConsumable({...newConsumable, notes: e.target.value})}
                        placeholder="Additional information"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddConsumable}>
                      Add Item
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
          <CardDescription>
            Track stock levels of academy consumables like water, snacks, and medical supplies.
            {consumables.length > 0 && (
              <>
                {' '}Total items: {consumables.length} | Low stock: {lowStockItems.length}
              </>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Consumables</AlertTitle>
              <AlertDescription>
                <p>{error}</p>
                <Button size="sm" className="mt-2" onClick={fetchConsumables}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stock Status Alert */}
          {lowStockItems.length > 0 ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Restock Alert!</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>The following items are running low or are out of stock:</p>
                  <ul className="list-disc list-inside">
                    {lowStockItems.slice(0, 3).map(item => (
                      <li key={item.id}>
                        <span className="font-medium">{item.name}</span> - {item.currentStock} {item.unit} remaining
                      </li>
                    ))}
                    {lowStockItems.length > 3 && (
                      <li>...and {lowStockItems.length - 3} more items</li>
                    )}
                  </ul>
                  <p className="mt-2">Based on current stock levels, a restock is recommended.</p>
                </div>
                <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="mt-4">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Create Purchase Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create Purchase Order</DialogTitle>
                      <DialogDescription>
                        Review and confirm the purchase order for low stock items.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input
                          id="supplier"
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          placeholder="Enter supplier name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Enter order notes"
                        />
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Order Summary</h4>
                        <div className="space-y-3">
                          {calculateOrderQuantities().map((item) => (
                            <div key={item.consumableId} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} {item.unit} @ {formatCurrency(item.pricePerUnit)} each
                                </p>
                              </div>
                              <p className="font-medium">
                                {formatCurrency(item.quantity * item.pricePerUnit)}
                              </p>
                            </div>
                          ))}
                          <div className="border-t pt-3 flex justify-between items-center font-bold">
                            <span>Total Amount</span>
                            <span>{formatCurrency(calculateTotalAmount(calculateOrderQuantities()))}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsPurchaseDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleCreatePurchaseOrder}>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Confirm Order
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </AlertDescription>
            </Alert>
          ) : consumables.length > 0 && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">All items in stock</AlertTitle>
              <AlertDescription className="text-green-700">
                All consumables are sufficiently stocked. No immediate action required.
              </AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <div className="mb-6 p-4 border rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="mb-2">Search Items</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, category, supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="category-filter" className="mb-2">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-48">
                <Label htmlFor="location-filter" className="mb-2">Location</Label>
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger id="location-filter">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredConsumables.length} of {consumables.length} items
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Edit Item Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Consumable Item</DialogTitle>
                <DialogDescription>
                  Update the details of this consumable item.
                </DialogDescription>
              </DialogHeader>
              {editingItem && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Item Name *</Label>
                    <Input
                      id="edit-name"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category *</Label>
                      <Select
                        value={editingItem.category}
                        onValueChange={(value) => setEditingItem({...editingItem, category: value})}
                      >
                        <SelectTrigger id="edit-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-unit">Unit *</Label>
                      <Select
                        value={editingItem.unit}
                        onValueChange={(value) => setEditingItem({...editingItem, unit: value})}
                      >
                        <SelectTrigger id="edit-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-currentStock">Current Stock *</Label>
                      <Input
                        id="edit-currentStock"
                        type="number"
                        min="0"
                        step="1"
                        value={editingItem.currentStock}
                        onChange={(e) => setEditingItem({...editingItem, currentStock: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-lowStockThreshold">Low Stock Threshold *</Label>
                      <Input
                        id="edit-lowStockThreshold"
                        type="number"
                        min="1"
                        step="1"
                        value={editingItem.lowStockThreshold}
                        onChange={(e) => setEditingItem({...editingItem, lowStockThreshold: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-minOrderQuantity">Min Order Qty *</Label>
                      <Input
                        id="edit-minOrderQuantity"
                        type="number"
                        min="1"
                        step="1"
                        value={editingItem.minOrderQuantity}
                        onChange={(e) => setEditingItem({...editingItem, minOrderQuantity: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-pricePerUnit">Price Per Unit ($)</Label>
                      <Input
                        id="edit-pricePerUnit"
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingItem.pricePerUnit || 0}
                        onChange={(e) => setEditingItem({...editingItem, pricePerUnit: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Select
                        value={editingItem.location}
                        onValueChange={(value) => setEditingItem({...editingItem, location: value})}
                      >
                        <SelectTrigger id="edit-location">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOCATIONS.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-supplier">Supplier</Label>
                    <Input
                      id="edit-supplier"
                      value={editingItem.supplier || ''}
                      onChange={(e) => setEditingItem({...editingItem, supplier: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea
                      id="edit-notes"
                      value={editingItem.notes || ''}
                      onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditConsumable}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Consumables List */}
          {filteredConsumables.length > 0 ? (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Items ({filteredConsumables.length})</TabsTrigger>
                <TabsTrigger value="low">Low Stock ({filteredConsumables.filter(c => c.stockStatus === 'Low Stock').length})</TabsTrigger>
                <TabsTrigger value="out">Out of Stock ({filteredConsumables.filter(c => c.stockStatus === 'Out of Stock').length})</TabsTrigger>
                <TabsTrigger value="categories">By Category</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConsumables.map((item) => (
                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-lg truncate">{item.name}</h3>
                            <div className="flex items-center gap-1">
                              <Badge variant={getBadgeVariant(item.stockStatus)}>
                                {item.stockStatus}
                              </Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteConsumable(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                Stock: {item.currentStock} {item.unit}
                              </span>
                              <span className="font-medium">
                                Threshold: {item.lowStockThreshold} {item.unit}
                              </span>
                            </div>
                            <Progress value={item.progress} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Category:</span>
                              <span className="ml-2 font-medium">{item.category}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <span className="ml-2 font-medium">{item.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {formatCurrency(item.pricePerUnit || 0)}/{item.unit}
                              </p>
                              {item.supplier && (
                                <p className="text-xs text-muted-foreground">Supplier: {item.supplier}</p>
                              )}
                              {item.lastRestocked && (
                                <p className="text-xs text-muted-foreground">
                                  Last restocked: {formatDate(item.lastRestocked)}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStockStatus(item.id, 1, 'use')}
                                disabled={item.currentStock <= 0}
                              >
                                Use 1
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleRestockItem(item.id)}
                              >
                                Restock
                              </Button>
                            </div>
                          </div>
                          
                          {item.notes && (
                            <div className="border-t pt-2">
                              <p className="text-sm text-muted-foreground">{item.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="low">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConsumables
                    .filter(item => item.stockStatus === 'Low Stock')
                    .map((item) => (
                      <Card key={item.id} className="border-amber-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          {/* Same item display as above */}
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium text-lg truncate">{item.name}</h3>
                              <Badge variant="secondary">Low Stock</Badge>
                            </div>
                            {/* ... rest of item display ... */}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="out">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredConsumables
                    .filter(item => item.stockStatus === 'Out of Stock')
                    .map((item) => (
                      <Card key={item.id} className="border-red-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium text-lg truncate">{item.name}</h3>
                              <Badge variant="destructive">Out of Stock</Badge>
                            </div>
                            {/* ... rest of item display ... */}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="categories">
                {categories.map(category => {
                  const categoryItems = filteredConsumables.filter(c => c.category === category);
                  if (categoryItems.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-lg">{category} ({categoryItems.length})</h3>
                        <Badge variant="outline">
                          Total Value: {formatCurrency(
                            categoryItems.reduce((sum, item) => 
                              sum + (item.currentStock * (item.pricePerUnit || 0)), 0
                            )
                          )}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryItems.map(item => (
                          <Card key={item.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium truncate">{item.name}</h4>
                                  <Badge variant={getBadgeVariant(item.stockStatus)}>
                                    {item.stockStatus}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {item.currentStock} {item.unit} • {item.location}
                                </p>
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">
                                    {formatCurrency(item.pricePerUnit || 0)}/{item.unit}
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateStockStatus(item.id, 1, 'use')}
                                      disabled={item.currentStock <= 0}
                                    >
                                      Use
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => handleRestockItem(item.id)}
                                    >
                                      Restock
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No consumables found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedLocation !== 'all' 
                  ? 'No items match your filters. Try adjusting your search criteria.'
                  : 'Start by adding your first consumable item.'
                }
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Orders Section */}
      {purchaseOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              Recent Purchase Orders
            </CardTitle>
            <CardDescription>
              Purchase orders created for restocking consumables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchaseOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{order.id}</h4>
                      <p className="text-sm text-muted-foreground">
                        Supplier: {order.supplier}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created: {order.createdAt.toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Items: {order.items.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
                      <Badge variant={
                        order.status === 'pending' ? 'secondary' :
                        order.status === 'ordered' ? 'default' : 'default'
                      }>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {order.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{order.notes}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updatedOrders = purchaseOrders.map(o => 
                          o.id === order.id ? { ...o, status: 'ordered' as const } : o
                        );
                        setPurchaseOrders(updatedOrders);
                        localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
                        toast.success('Order marked as placed');
                      }}
                    >
                      Mark as Ordered
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const updatedOrders = purchaseOrders.map(o => 
                          o.id === order.id ? { ...o, status: 'delivered' as const } : o
                        );
                        setPurchaseOrders(updatedOrders);
                        localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
                        toast.success('Order marked as delivered');
                      }}
                    >
                      Mark as Delivered
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}