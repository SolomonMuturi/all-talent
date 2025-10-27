'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const ticketTiers = [
  { name: 'VIP', price: 2000 },
  { name: 'Regular', price: 500 },
  { name: 'Student', price: 200 },
];

const formSchema = z.object({
  fullName: z.string().nonempty({ message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.'}),
  phone: z.string().regex(/^(0|7|1)\d{8}$/, 'Please enter a valid 9-digit phone number (e.g., 712345678).'),
  ticketTier: z.string().nonempty({ message: 'Please select a ticket tier.' }),
});

export function TicketBookingForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      ticketTier: '',
    },
  });
  
  const handleTierChange = (tierName: string) => {
      const tier = ticketTiers.find(t => t.name === tierName);
      setSelectedPrice(tier ? tier.price : null);
      form.setValue('ticketTier', tierName);
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsBookingComplete(false);
    
    const phoneNumber = `254${values.phone.replace(/^0+/, '')}`;
    const submissionValues = {...values, phoneNumber};

    console.log('Simulating M-Pesa STK Push:', submissionValues);

    setTimeout(() => {
      toast({
        title: 'Booking Confirmed!',
        description: `Your ${values.ticketTier} ticket has been sent to ${values.email} and ${phoneNumber}.`,
      });
      setIsLoading(false);
      setIsBookingComplete(true);
      form.reset();
      setSelectedPrice(null);
    }, 2500);
  }

  if (isBookingComplete) {
      return (
          <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle className="font-headline">Booking Successful!</AlertTitle>
              <AlertDescription>
                Your e-ticket has been sent to your phone and email. Thank you for your purchase!
              </AlertDescription>
              <Button onClick={() => setIsBookingComplete(false)} className="mt-4">Book Another Ticket</Button>
          </Alert>
      )
  }

  return (
    <div className="flex justify-center">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="font-headline">U-17 Regional Finals</CardTitle>
                <CardDescription>Fill in your details below to complete your booking.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Jane Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="e.g., jane.doe@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                            Your e-ticket will be sent to this email address.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <FormField
                    control={form.control}
                    name="ticketTier"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ticket Tier</FormLabel>
                        <Select onValueChange={handleTierChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a ticket tier" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {ticketTiers.map((tier) => (
                                    <SelectItem key={tier.name} value={tier.name}>
                                        {tier.name} - KES {tier.price.toLocaleString()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    {selectedPrice !== null && (
                         <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>M-Pesa Phone Number</FormLabel>
                                <div className="flex items-center">
                                    <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm">
                                    +254
                                    </div>
                                    <FormControl>
                                        <Input 
                                            type="tel" 
                                            placeholder="712345678" 
                                            className="rounded-l-none"
                                            {...field} 
                                        />
                                    </FormControl>
                                </div>
                                <FormDescription>
                                    You will receive an M-Pesa prompt to pay KES {selectedPrice.toLocaleString()}.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    
                    <Button type="submit" disabled={isLoading || !selectedPrice} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Processing...' : (selectedPrice ? `Book & Pay KES ${selectedPrice.toLocaleString()}` : 'Select a Tier')}
                    </Button>
                </form>
                </Form>
        </CardContent>
        </Card>
    </div>
  );
}