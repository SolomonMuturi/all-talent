
import { ProductManagementTable } from "@/components/merchandise/product-management-table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { products } from "@/lib/merchandise";
import { DollarSign, TrendingUp, TrendingDown, Package, BarChart, PieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from "recharts";

const chartConfig = {
  sales: {
    label: "Sales (Units)",
    color: "hsl(var(--chart-1))",
  },
  stock: {
    label: "Stock (Units)",
    color: "hsl(var(--chart-2))",
  }
};

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function ManageProductsPage() {
  const totalRevenue = products.reduce((acc, p) => acc + p.price * p.sales, 0);
  const bestSelling = [...products].sort((a, b) => b.sales - a.sales)[0];
  const lowStockCount = products.filter(p => p.stock < p.lowStockThreshold).length;

  const salesData = products.map(p => ({ name: p.name, sales: p.sales, stock: p.stock }));
  const categoryStockData = products.reduce((acc, p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
        existing.value += p.stock;
    } else {
        acc.push({ name: p.category, value: p.stock });
    }
    return acc;
  }, [] as { name: string; value: number }[]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Manage Products & Inventory</h1>
        <p className="text-muted-foreground">
          Track stock, analyze sales, and manage all products in your store.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Total Revenue"
          value={`KES ${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="size-5 text-muted-foreground" />}
          description="All-time merchandise sales"
        />
        <KpiCard
          title="Best-Selling Product"
          value={bestSelling.name}
          icon={<TrendingUp className="size-5 text-muted-foreground" />}
          description={`${bestSelling.sales} units sold`}
        />
        <KpiCard
          title="Low Stock Items"
          value={String(lowStockCount)}
          icon={<Package className="size-5 text-muted-foreground" />}
          description="Items needing to be restocked"
        />
      </div>

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Product List</TabsTrigger>
          <TabsTrigger value="analytics">Inventory & Sales Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductManagementTable />
        </TabsContent>
        <TabsContent value="analytics">
           <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><BarChart /> Sales & Stock Overview</CardTitle>
                        <CardDescription>Units sold vs. current stock levels for each product.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={salesData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
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
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                    <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {label}
                                                        </span>
                                                        <span className="font-bold text-muted-foreground">
                                                         Sales: {payload[0].value}
                                                        </span>
                                                         <span className="font-bold text-muted-foreground">
                                                         Stock: {payload[1].value}
                                                        </span>
                                                    </div>
                                                    </div>
                                                </div>
                                                )
                                            }
                                            return null
                                            }}
                                    />
                                    <Legend />
                                    <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="stock" fill="var(--color-stock)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><PieChart /> Stock Distribution</CardTitle>
                        <CardDescription>Breakdown of current stock by category.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                        data={categoryStockData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    >
                                        {categoryStockData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
