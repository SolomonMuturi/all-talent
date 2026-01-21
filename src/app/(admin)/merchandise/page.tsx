'use client';

import { useEffect, useState } from "react";
import { MerchandiseStore } from "@/components/merchandise/merchandise-store";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, TrendingUp, Package } from "lucide-react";
import Link from "next/link";
import { KpiCard } from "@/components/dashboard/kpi-card";

export default function MerchandisePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/merchandise");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data.data?.products || []);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <div>Loading merchandise...</div>;
  }
  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  const totalRevenue = products.reduce((acc, p) => acc + (p.price || 0) * (p.sales || 0), 0);
  const bestSelling = [...products].sort((a, b) => (b.sales || 0) - (a.sales || 0))[0] || { name: "N/A", sales: 0 };
  const lowStockCount = products.filter(p => (p.stock || 0) < (p.lowStockThreshold || 0)).length;


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Merchandise Store</h1>
            <p className="text-muted-foreground">
            Browse and purchase official academy merchandise.
            </p>
        </div>
        <Button asChild>
          <Link href="/merchandise/manage">
            <Settings className="mr-2 h-4 w-4" />
            Manage Products
          </Link>
        </Button>
      </div>

       <div className="grid gap-4 md:grid-cols-3">
        <Link href="/finances">
          <KpiCard
            title="Total Revenue"
            value={`KES ${totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="size-5 text-muted-foreground" />}
            description="All-time merchandise sales"
          />
        </Link>
        <Link href="/merchandise/manage">
          <KpiCard
            title="Best-Selling Product"
            value={bestSelling.name}
            icon={<TrendingUp className="size-5 text-muted-foreground" />}
            description={`${bestSelling.sales} units sold`}
          />
        </Link>
        <Link href="/merchandise/manage">
          <KpiCard
            title="Low Stock Items"
            value={String(lowStockCount)}
            icon={<Package className="size-5 text-muted-foreground" />}
            description="Items needing to be restocked"
          />
        </Link>
      </div>

      <MerchandiseStore products={products} />
    </div>
  );
}
