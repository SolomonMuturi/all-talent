'use client';

import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  Package, 
  Wallet, 
  DollarSign, 
  BarChart as BarChartIcon,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  sales: number;
  category: string;
  image?: string;
  lowStockThreshold?: number;
}

const chartConfig = {
  profit: {
    label: "Profit (KES)",
    color: "hsl(var(--chart-1))",
  },
  sales: {
    label: "Sales (Units)",
    color: "hsl(var(--chart-2))",
  },
  stock: {
    label: "Stock (Units)",
    color: "hsl(var(--chart-3))",
  }
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function MerchandiseBIDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      setError(null);
      const res = await fetch('/api/merchandise');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      
      // Ensure all products have cost (if not, estimate at 50% of price)
      const productsWithCost = (data.data?.products || []).map((p: any) => ({
        ...p,
        cost: p.cost || p.price * 0.5,
        sales: p.sales || 0,
        stock: p.stock || 0,
      }));
      
      setProducts(productsWithCost);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      // Fallback mock data
      setProducts([
        { id: '1', name: 'Official Jersey', price: 2500, cost: 1200, stock: 50, sales: 45, category: 'Apparel' },
        { id: '2', name: 'Training Kit', price: 1800, cost: 900, stock: 30, sales: 30, category: 'Apparel' },
        { id: '3', name: 'Water Bottle', price: 500, cost: 200, stock: 100, sales: 60, category: 'Accessories' },
        { id: '4', name: 'Academy Scarf', price: 800, cost: 350, stock: 40, sales: 25, category: 'Accessories' },
        { id: '5', name: 'Football', price: 1200, cost: 600, stock: 25, sales: 15, category: 'Equipment' },
        { id: '6', name: 'Goalkeeper Gloves', price: 1500, cost: 750, stock: 15, sales: 8, category: 'Equipment' },
        { id: '7', name: 'Training Cones', price: 300, cost: 100, stock: 200, sales: 35, category: 'Equipment' },
        { id: '8', name: 'Backpack', price: 2000, cost: 1000, stock: 20, sales: 12, category: 'Accessories' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Merchandise BI Dashboard</h1>
            <p className="text-muted-foreground">
              Deep dive into merchandise sales, profit, and inventory performance.
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // If no products, show empty state
  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Merchandise BI Dashboard</h1>
            <p className="text-muted-foreground">
              Deep dive into merchandise sales, profit, and inventory performance.
            </p>
          </div>
          <Button asChild>
            <Link href="/merchandise/add">
              <Package className="mr-2 h-4 w-4" />
              Add First Product
            </Link>
          </Button>
        </div>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
          <p className="text-muted-foreground mb-4">
            Add some products to start seeing analytics.
          </p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.cost || p.price * 0.5) * p.stock, 0);
  const totalProfit = products.reduce((acc, p) => acc + (p.price - (p.cost || p.price * 0.5)) * p.sales, 0);
  const totalRevenue = products.reduce((acc, p) => acc + p.price * p.sales, 0);
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  
  const mostProfitable = [...products].sort((a, b) => 
    ((b.price - (b.cost || b.price * 0.5)) * b.sales) - 
    ((a.price - (a.cost || a.price * 0.5)) * a.sales)
  )[0];
  
  const slowMovingProducts = [...products]
    .sort((a, b) => a.sales - b.sales)
    .slice(0, 3);

  // Prepare chart data
  const profitData = products.map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
    profit: (p.price - (p.cost || p.price * 0.5)) * p.sales,
    fullName: p.name,
  })).sort((a, b) => b.profit - a.profit);

  const salesVelocityData = products.map(p => ({
    name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
    sales: p.sales,
    fullName: p.name,
  })).sort((a, b) => b.sales - a.sales);

  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
      existing.value += p.sales;
    } else {
      acc.push({ name: p.category, value: p.sales });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Merchandise BI Dashboard</h1>
          <p className="text-muted-foreground">
            Deep dive into merchandise sales, profit, and inventory performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild size="sm">
            <Link href="/merchandise/manage">
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/finances">
          <KpiCard
            title="Total Profit"
            value={`KES ${totalProfit.toLocaleString()}`}
            icon={<DollarSign className="size-5 text-muted-foreground" />}
            description="From all merchandise sales"
          />
        </Link>
        <Link href="/merchandise/manage">
          <KpiCard
            title="Most Profitable Item"
            value={mostProfitable?.name || 'N/A'}
            icon={<TrendingUp className="size-5 text-muted-foreground" />}
            description={mostProfitable ? `Generated KES ${((mostProfitable.price - (mostProfitable.cost || mostProfitable.price * 0.5)) * mostProfitable.sales).toLocaleString()} in profit` : 'No data'}
          />
        </Link>
        <Link href="/merchandise/manage">
          <KpiCard
            title="Total Inventory Value"
            value={`KES ${totalInventoryValue.toLocaleString()}`}
            icon={<Wallet className="size-5 text-muted-foreground" />}
            description="Value of all items in stock"
          />
        </Link>
        <Link href="/merchandise/manage">
          <KpiCard
            title="Total Revenue"
            value={`KES ${totalRevenue.toLocaleString()}`}
            icon={<TrendingUp className="size-5 text-muted-foreground" />}
            description="All-time sales revenue"
          />
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BarChartIcon /> Profit per Item
            </CardTitle>
            <CardDescription>Total profit generated by each product.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={profitData} layout="vertical" margin={{ right: 20 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis 
                    type="number" 
                    dataKey="profit" 
                    tickFormatter={(value) => `KES ${Number(value) / 1000}k`} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    width={100} 
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <p className="font-bold">{data.fullName || data.name}</p>
                            <p>Profit: KES {data.profit?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="profit" fill="var(--color-profit)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <TrendingUp /> Sales Velocity
            </CardTitle>
            <CardDescription>Units sold for each product (best to worst).</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesVelocityData}>
                  <CartesianGrid vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    interval={0} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <p className="font-bold">{data.fullName || data.name}</p>
                            <p>Sales: {data.sales} units</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Sales by Category</CardTitle>
          <CardDescription>Distribution of sales across product categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[300px]">
              <ChartContainer config={{}} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="p-2 text-sm bg-background/80 rounded-md border backdrop-blur-sm">
                              <p className="font-medium">{`${payload[0].name}: ${payload[0].value} units`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              {categoryData.map((cat, index) => (
                <div key={cat.name} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <Badge variant="outline">{cat.value} units</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slow-Moving Products */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <TrendingDown /> Slow-Moving Products
          </CardTitle>
          <CardDescription>
            These products have the lowest sales and may require marketing focus or discontinuation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slowMovingProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Stock on Hand</TableHead>
                  <TableHead className="text-right">Inventory Value</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slowMovingProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{product.sales}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-right">
                      KES {(product.stock * (product.cost || product.price * 0.5)).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">Low Velocity</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No slow-moving products found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}