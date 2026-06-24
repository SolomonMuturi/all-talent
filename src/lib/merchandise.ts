export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  imageUrl?: string;
  imageHint?: string;
  stock: number;
  lowStockThreshold: number;
  sales: number;
  sizes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductWithQuantity extends Product {
  quantity: number;
}