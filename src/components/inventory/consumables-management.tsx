'use client';

import { BarChart, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { consumables, type Consumable } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const getStockStatus = (item: Consumable) => {
  if (item.currentStock <= 0) {
    return 'Out of Stock';
  }
  if (item.currentStock < item.lowStockThreshold) {
    return 'Low Stock';
  }
  return 'In Stock';
};

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
}

export function ConsumablesManagement() {
    const lowStockItems = consumables.filter(item => getStockStatus(item) === 'Low Stock' || getStockStatus(item) === 'Out of Stock');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Package className="size-5" />
            Consumables Management
        </CardTitle>
        <CardDescription>
          Track stock levels of academy consumables like water, snacks, and medical supplies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockItems.length > 0 && (
            <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Restock Alert!</AlertTitle>
                <AlertDescription>
                    The following items are running low or are out of stock: {lowStockItems.map(item => item.name).join(', ')}. Based on the upcoming U-19 tournament, a restock is recommended.
                </AlertDescription>
                 <Button size="sm" className="mt-4">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Create Purchase Order
                </Button>
            </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {consumables.map((item) => {
            const status = getStockStatus(item);
            const progress = (item.currentStock / (item.lowStockThreshold * 2)) * 100; // Assume max stock is 2x threshold for viz

            return (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{item.name}</h3>
                     <Badge variant={getBadgeVariant(status)}>{status}</Badge>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {item.currentStock} / {item.lowStockThreshold * 2} {item.unit}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
