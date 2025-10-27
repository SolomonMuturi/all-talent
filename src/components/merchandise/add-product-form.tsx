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
});

const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

export function AddProductForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        productName: '',
        price: undefined,
        category: '',
        description: '',
        sizes: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log('Simulating product creation:', values);

    setTimeout(() => {
      toast({
        title: 'Product Added',
        description: `${values.productName} has been successfully added to your store.`,
      });
      setIsSubmitting(false);
      form.reset();
    }, 2000);
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
                            <Input placeholder="e.g., Home Jersey 24/25" {...field} />
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
                                <Input type="number" placeholder="3500" {...field} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Textarea placeholder="A brief description of the product..." {...field} />
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
                                            checked={field.value?.includes(item)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), item])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== item
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        {item}
                                        </FormLabel>
                                    </FormItem>
                                    )
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
                            </div>
                            <Input id="product-image-upload" type="file" className="hidden" />
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
