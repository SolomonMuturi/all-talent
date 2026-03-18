'use client';

import { useState, useEffect } from 'react';
import { Package, ShoppingCart, AlertCircle, Plus, RefreshCw } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Consumable {
  id: number;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  lowStockThreshold: number;
  minOrderQuantity: number;
  pricePerUnit?: number;
  supplier?: string;
  lastRestocked?: string;
  nextRestockDate?: string;
  location: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  needsRestock: boolean;
  progress: number;
  notes?: string;
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
  const router = useRouter();
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [supplier, setSupplier] = useState('Sports Supply Co.');
  const [notes, setNotes] = useState('Restock for upcoming U-19 tournament');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchConsumables();
    // Load saved purchase orders from localStorage
    const savedOrders = localStorage.getItem('purchaseOrders');
    if (savedOrders) {
      try {
        const orders = JSON.parse(savedOrders);
        // Convert string dates back to Date objects
        const parsedOrders = orders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
        }));
        setPurchaseOrders(parsedOrders);
      } catch (err) {
        console.error('Error parsing saved purchase orders:', err);
      }
    }
  }, []);

  const fetchConsumables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/consumables');
      const data = await response.json();
      
      if (data.success) {
        setConsumables(data.data.consumables);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch consumables');
        toast.error(data.error || 'Failed to fetch consumables');
      }
    } catch (err) {
      setError('An error occurred while fetching consumables');
      toast.error('Network error. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchConsumables();
  };

  // Function to navigate to AddConsumable page - CORRECTED ROUTE
  const handleAddConsumable = () => {
    // Since your AddConsumable.tsx is in the /inventory folder, use this route:
    router.push('/inventory/add-consumable');
    // OR if you prefer a different route, adjust accordingly
    // router.push('/inventory/add');
  };

  const lowStockItems = consumables.filter(item => item.needsRestock);

  const calculateOrderQuantities = () => {
    return lowStockItems.map(item => {
      // Order enough to reach 150% of low stock threshold
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
    
    setIsDialogOpen(false);
    
    toast.success("Purchase Order Created!", {
      description: `Order #${newPurchaseOrder.id} has been created for $${totalAmount.toFixed(2)}`,
      action: {
        label: "Print Order",
        onClick: () => {
          // Create a print-friendly version
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

  const handleRestockItem = async (itemId: number) => {
    try {
      const item = consumables.find(c => c.id === itemId);
      if (!item) return;

      // Calculate restock quantity (minimum order quantity or more)
      const restockQuantity = Math.max(
        item.minOrderQuantity,
        Math.ceil(item.lowStockThreshold * 1.5 - item.currentStock)
      );

      // Update stock in database
      const response = await fetch('/api/consumables', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          currentStock: item.currentStock + restockQuantity,
          lastRestocked: new Date().toISOString().split('T')[0]
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Item restocked successfully", {
          description: `${restockQuantity} ${item.unit} of ${item.name} added to stock.`,
        });
        
        // Refresh the consumables list
        fetchConsumables();
      } else {
        toast.error("Failed to restock item", {
          description: data.error || 'Please try again.',
        });
      }
    } catch (err) {
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      });
      console.error(err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const updateStockStatus = async (itemId: number, adjustment: number, type: 'use' | 'restock') => {
    try {
      const item = consumables.find(c => c.id === itemId);
      if (!item) return;

      const newStock = type === 'use' 
        ? Math.max(0, item.currentStock - adjustment)
        : item.currentStock + adjustment;

      const response = await fetch('/api/consumables', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          currentStock: newStock,
          ...(type === 'restock' && { lastRestocked: new Date().toISOString().split('T')[0] })
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Stock ${type === 'use' ? 'used' : 'restocked'}`, {
          description: `${adjustment} ${item.unit} ${type === 'use' ? 'removed from' : 'added to'} ${item.name}.`,
        });
        
        // Refresh the consumables list
        fetchConsumables();
      } else {
        toast.error("Failed to update stock", {
          description: data.error || 'Please try again.',
        });
      }
    } catch (err) {
      toast.error("Network error", {
        description: "Please check your connection and try again.",
      });
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-500">Loading consumables...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
              {/* Option 1: Using Button with onClick */}
              <Button 
                size="sm" 
                onClick={handleAddConsumable}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
              
              {/* Option 2: Using Link component (alternative) */}
              {/* 
              <Link href="/inventory/add-consumable">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </Link>
              */}
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
          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                <p>{error}</p>
                <Button size="sm" className="mt-2" onClick={fetchConsumables}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : lowStockItems.length > 0 ? (
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                          onClick={() => setIsDialogOpen(false)}
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

          {consumables.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {consumables.map((item) => {
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant={getBadgeVariant(item.stockStatus)}>
                          {item.stockStatus}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <Progress value={item.progress} className="h-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.currentStock} {item.unit} remaining
                          </span>
                          <span className="font-medium">
                            Threshold: {item.lowStockThreshold} {item.unit}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {item.category} • {item.location}
                        </span>
                        {item.pricePerUnit && (
                          <span className="font-medium">
                            ${item.pricePerUnit.toFixed(2)}/{item.unit}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStockStatus(item.id, 1, 'use')}
                          disabled={item.currentStock <= 0}
                        >
                          Use 1 {item.unit}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestockItem(item.id)}
                        >
                          Restock
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No consumables found</h3>
              <p className="text-gray-500 mb-4">Start by adding your first consumable item.</p>
              <Button onClick={handleAddConsumable}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {purchaseOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              Recent Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {purchaseOrders.slice(0, 3).map((order) => (
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
                        // Mark as ordered
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
                        // Mark as delivered
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