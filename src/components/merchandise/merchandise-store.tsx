'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from './product-card';

export function MerchandiseStore({ products: propProducts }: { products?: any[] }) {
  const [products, setProducts] = useState<any[]>(propProducts || []);
  const [loading, setLoading] = useState(!propProducts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propProducts) {
      setProducts(propProducts);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch('/api/merchandise')
      .then(res => res.json())
      .then(data => {
        setProducts(data.data?.products || []);
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [propProducts]);

  if (loading) {
    return <div>Loading merchandise...</div>;
  }
  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={{
            ...product,
            // Ensure sizes is always an array for ProductCard
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
