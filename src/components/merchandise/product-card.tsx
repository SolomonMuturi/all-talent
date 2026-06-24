'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ImageIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
  imageHint?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');

  const imageUrl = product.image || product.imageUrl || '';
  const hasImage = imageUrl && imageUrl.trim() !== '';
  const showImage = hasImage && !imageError;
  const isLowStock = product.stock < (product.lowStockThreshold || 5);
  const isPopular = (product.sales || 0) > 20;

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: 'Select Size',
        description: 'Please select a size before adding to cart.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Added to Cart',
      description: `${product.name}${selectedSize ? ` (${selectedSize})` : ''} has been added to your cart.`,
      variant: 'default',
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full">
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full bg-muted">
          {showImage ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized={imageUrl.startsWith('/uploads/') || imageUrl.startsWith('data:')}
              data-ai-hint={product.imageHint}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
              <span className="text-sm text-muted-foreground mt-2">No Image</span>
            </div>
          )}
          {isLowStock && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Low Stock
            </Badge>
          )}
          {isPopular && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              ⭐ Popular
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-headline line-clamp-1">
          {product.name}
        </CardTitle>
        {product.category && (
          <p className="text-xs text-muted-foreground mt-1">
            {product.category}
          </p>
        )}
        {product.description && (
          <CardDescription className="mt-2 line-clamp-2">
            {product.description}
          </CardDescription>
        )}
        <p className="text-primary font-semibold text-lg mt-2">
          KES {product.price.toLocaleString()}
        </p>
        {product.sales !== undefined && (
          <p className="text-xs text-muted-foreground">
            {product.sales} sold
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-4 pt-0">
        {product.sizes && product.sizes.length > 0 && (
          <Select onValueChange={setSelectedSize} value={selectedSize}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {product.sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}