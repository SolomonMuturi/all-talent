'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';

interface Product {
  id: string;
  name: string;
  price: number;
  sales?: number;
  stock: number;
  lowStockThreshold?: number;
  image?: string;
  imageUrl?: string;
  description?: string;
  category?: string;
  sizes?: string[];
}

interface MerchandiseStoreProps {
  products?: Product[];
}

export function MerchandiseStore({ products: propProducts }: MerchandiseStoreProps) {
  const [products, setProducts] = useState<Product[]>(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    fetch('/api/merchandise')
      .then(res => res.json())
      .then(data => {
        const fetchedProducts = data.data?.products || [];
        // Ensure both image and imageUrl are set
        const normalizedProducts = fetchedProducts.map((p: any) => ({
          ...p,
          image: p.image || p.imageUrl || '',
          imageUrl: p.imageUrl || p.image || '',
        }));
        setProducts(normalizedProducts);
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [propProducts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading merchandise...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive text-center py-8">{error}</div>;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
        <p className="text-muted-foreground">Check back later for new merchandise.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={{
            ...product,
            sizes: Array.isArray(product.sizes)
              ? product.sizes
              : typeof product.sizes === 'string' && product.sizes
                ? (() => {
                    try {
                      const parsed = JSON.parse(product.sizes);
                      return Array.isArray(parsed) ? parsed : [];
                    } catch {
                      return [];
                    }
                  })()
                : [],
          }}
        />
      ))}
    </div>
  );
}