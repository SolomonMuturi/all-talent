
export type Product = {
  id: string;
  name: string;
  price: number;
  cost: number;
  imageUrl: string;
  imageHint: string;
  category: 'Apparel' | 'Accessories' | 'Other';
  sizes?: string[];
  stock: number;
  sales: number;
  lowStockThreshold: number;
};

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Home Jersey 24/25',
    price: 3500,
    cost: 1500,
    imageUrl: 'https://picsum.photos/seed/merch1/600/600',
    imageHint: 'football jersey',
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 120,
    sales: 88,
    lowStockThreshold: 20,
  },
  {
    id: 'prod-002',
    name: 'Away Jersey 24/25',
    price: 3500,
    cost: 1500,
    imageUrl: 'https://picsum.photos/seed/merch2/600/600',
    imageHint: 'football jersey white',
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 85,
    sales: 42,
    lowStockThreshold: 20,
  },
  {
    id: 'prod-003',
    name: 'Academy Scarf',
    price: 1500,
    cost: 600,
    imageUrl: 'https://picsum.photos/seed/merch3/600/600',
    imageHint: 'football scarf',
    category: 'Accessories',
    stock: 200,
    sales: 150,
    lowStockThreshold: 30,
  },
  {
    id: 'prod-004',
    name: 'Training Top',
    price: 2500,
    cost: 1100,
    imageUrl: 'https://picsum.photos/seed/merch4/600/600',
    imageHint: 'training shirt',
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 150,
    sales: 95,
    lowStockThreshold: 25,
  },
    {
    id: 'prod-005',
    name: 'Academy Beanie',
    price: 1200,
    cost: 500,
    imageUrl: 'https://picsum.photos/seed/merch5/600/600',
    imageHint: 'beanie hat',
    category: 'Accessories',
    stock: 75,
    sales: 15,
    lowStockThreshold: 20,
  },
    {
    id: 'prod-006',
    name: 'Logo Cap',
    price: 1800,
    cost: 750,
    imageUrl: 'https://picsum.photos/seed/merch6/600/600',
    imageHint: 'baseball cap',
    category: 'Accessories',
    stock: 90,
    sales: 60,
    lowStockThreshold: 15,
  },
];
