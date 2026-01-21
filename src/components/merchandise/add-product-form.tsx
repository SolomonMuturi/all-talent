'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2, UploadCloud } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';

const formSchema = z.object({
  productName: z.string().nonempty({ message: 'Product name is required.' }),
  price: z.coerce.number().positive({ message: 'Please enter a valid price.' }),
  category: z.string().nonempty({ message: 'Please select a category.' }),
  description: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  image: z.any().optional(),
});

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

export function AddProductForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      price: '',
      category: '',
      description: '',
      sizes: [],
      image: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.productName);
      formData.append('price', String(values.price));
      formData.append('category', values.category);
      if (values.description) formData.append('description', values.description);
      if (values.sizes && values.sizes.length > 0) formData.append('sizes', JSON.stringify(values.sizes));
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/merchandise', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: 'Product Added',
          description: `${values.productName} has been successfully added to your store.`,
        });
        form.reset();
        setImageFile(null);
      } else {
        throw new Error(data.error || 'Failed to add product');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Home Jersey 24/25" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (KES)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="3500"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Apparel">Apparel</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief description of the product..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Sizes</FormLabel>
                    <FormDescription>
                      Select the sizes available for this product.
                    </FormDescription>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {availableSizes.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="sizes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={Array.isArray(field.value) && field.value.includes(item)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), item]);
                                    } else {
                                      field.onChange(
                                        (field.value || []).filter((value: string) => value !== item)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Product Image</FormLabel>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="product-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG or JPG</p>
                    {imageFile && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>
                  <Input
                    id="product-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      setImageFile(file || null);
                    }}
                  />
                </label>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Adding Product...' : 'Add Product'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
