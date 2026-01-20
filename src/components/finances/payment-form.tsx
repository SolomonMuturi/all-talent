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
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  playerId: z.string().nonempty({ message: 'Please select a player.' }),
  amount: z.coerce.number().positive({ message: 'Please enter a valid amount.' }),
  phoneNumber: z.string().regex(/^254\d{9}$/, 'Phone number must be in the format 254XXXXXXXXX.'),
});

interface Player {
  id: number;
  name: string;
}

export function PaymentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerId: '',
      amount: 5000,
      phoneNumber: '254',
    },
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players?limit=1000');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPlayers(data.data.players);
        }
      }
    } catch (error) {
      console.error('Failed to fetch players:', error);
    } finally {
      setLoadingPlayers(false);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitPayment(values);
  }

  const submitPayment = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const selectedPlayer = players.find(p => p.id.toString() === values.playerId);
      
      const response = await fetch('/api/finances/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_name: selectedPlayer?.name || 'Unknown',
          date: new Date().toISOString().split('T')[0],
          amount: values.amount,
          type: 'Fee Payment',
          description: `Payment to ${values.phoneNumber}`,
          status: 'Pending'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment transaction');
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Payment Initiated',
          description: `A payment request of KES ${values.amount} has been sent to ${values.phoneNumber}.`,
        });
        form.reset();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to initiate payment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to initiate payment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
