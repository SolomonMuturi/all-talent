'use client';

import { useEffect, useState } from "react";
import { MerchandiseStore } from "@/components/merchandise/merchandise-store";
import { Button } from "@/components/ui/button";
import { Settings, DollarSign, TrendingUp, Package, PlusCircle } from "lucide-react";
import Link from "next/link";
import { KpiCard } from "@/components/dashboard/kpi-card";

interface Product {
  id: string;
  name: string;
  price: number;
  sales: number;
  stock: number;
  lowStockThreshold: number;
  image?: string;
  imageUrl?: string;
  description?: string;
  category?: string;
  sizes?: string[];
}

export default function MerchandisePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/merchandise");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const normalizedProducts = (data.data?.products || []).map((p: any) => ({
        ...p,
        image: p.image || p.imageUrl || '',
        imageUrl: p.imageUrl || p.image || '',
        sizes: Array.isArray(p.sizes) ? p.sizes : 
               typeof p.sizes === 'string' ? (() => {
                 try { return JSON.parse(p.sizes); } catch { return []; }
               })() : [],
      }));
      setProducts(normalizedProducts);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
      // Fallback mock data
      setProducts([
        {
          id: 'MOCK1',
          name: 'Official Jersey',
          price: 2500,
          sales: 45,
          stock: 12,
          lowStockThreshold: 5,
          image: 'https://picsum.photos/seed/jersey/400/300',
          description: 'Official academy jersey',
          category: 'Apparel',
          sizes: ['S', 'M', 'L', 'XL']
        },
        {
          id: 'MOCK2',
          name: 'Training Kit',
          price: 1800,
          sales: 30,
          stock: 8,
          lowStockThreshold: 5,
          image: 'https://picsum.photos/seed/training/400/300',
          description: 'Training kit for players',
          category: 'Apparel',
          sizes: ['S', 'M', 'L']
        },
        {
          id: 'MOCK3',
          name: 'Water Bottle',
          price: 500,
          sales: 60,
          stock: 20,
          lowStockThreshold: 5,
          image: 'https://picsum.photos/seed/bottle/400/300',
          description: 'Official academy water bottle',
          category: 'Accessories'
        },
        {
          id: 'MOCK4',
          name: 'Academy Scarf',
          price: 800,
          sales: 25,
          stock: 15,
          lowStockThreshold: 5,
          image: 'https://picsum.photos/seed/scarf/400/300',
          description: 'Official academy scarf',
          category: 'Accessories'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading merchandise...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
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
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Products</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchProducts}>Retry</Button>
        </div>
      </div>
    );
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
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/merchandise/manage">
              <Settings className="mr-2 h-4 w-4" />
              Manage Products
            </Link>
          </Button>
          <Button asChild>
            <Link href="/merchandise/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
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