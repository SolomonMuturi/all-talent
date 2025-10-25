'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { players } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  playerId: z.string().nonempty({ message: 'Please select a player.' }),
  amount: z.coerce.number().positive({ message: 'Please enter a valid amount.' }),
  phoneNumber: z.string().regex(/^254\d{9}$/, 'Phone number must be in the format 254XXXXXXXXX.'),
});

export function PaymentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerId: '',
      amount: 5000,
      phoneNumber: '254',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    console.log('Simulating M-Pesa C2B payment request:', values);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Payment Initiated',
        description: `A payment request of KES ${values.amount} has been sent to ${values.phoneNumber}.`,
      });
      setIsSubmitting(false);
      form.reset();
    }, 2000);
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Payment Details</CardTitle>
            <CardDescription>Enter payment information below. The payer will receive an M-Pesa prompt.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Player</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a player" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {players.map((player) => (
                            <SelectItem key={player.id} value={String(player.id)}>
                            {player.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount (KES)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>M-Pesa Phone Number</FormLabel>
                    <FormControl>
                        <Input placeholder="254712345678" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Processing...' : 'Initiate Payment'}
                </Button>
            </form>
            </Form>
      </CardContent>
    </Card>
  );
}
