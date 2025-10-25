export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  category: 'Apparel' | 'Accessories';
  sizes?: string[];
};

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Home Jersey 24/25',
    price: 3500,
    imageUrl: 'https://picsum.photos/seed/merch1/600/600',
    imageHint: 'football jersey',
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'prod-002',
    name: 'Away Jersey 24/25',
    price: 3500,
    imageUrl: 'https://picsum.photos/seed/merch2/600/600',
    imageHint: 'football jersey white',
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'prod-003',
    name: 'Academy Scarf',
    price: 1500,
    imageUrl: 'https://picsum.photos/seed/merch3/600/600',
    imageHint: 'football scarf',
    category: 'Accessories',
  },
  {
    id: 'prod-004',
    name: 'Training Top',
    price: 2500,
    imageUrl: 'https://picsum.photos/seed/merch4/600/600',
    imageHint: 'training shirt',
    category: 'Apparel',
    sizes: ['S', 'M', 'L', 'XL'],
  },
    {
    id: 'prod-005',
    name: 'Academy Beanie',
    price: 1200,
    imageUrl: 'https://picsum.photos/seed/merch5/600/600',
    imageHint: 'beanie hat',
    category: 'Accessories',
  },
    {
    id: 'prod-006',
    name: 'Logo Cap',
    price: 1800,
    imageUrl: 'https://picsum.photos/seed/merch6/600/600',
    imageHint: 'baseball cap',
    category: 'Accessories',
  },
];
