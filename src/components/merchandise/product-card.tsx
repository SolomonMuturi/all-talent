'use client';

import Image from 'next/image';
import { Product } from '@/lib/merchandise';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <div className="relative aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="rounded-t-lg object-cover"
            data-ai-hint={product.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
        <p className="text-primary font-semibold text-lg mt-1">
          KES {product.price.toLocaleString()}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-4 pt-0">
        {product.sizes && (
            <Select>
                <SelectTrigger>
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
        <Button className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
