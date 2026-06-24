// components/finances/payment-form.tsx
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle, Landmark, Smartphone } from 'lucide-react';

const formSchema = z.object({
  playerId: z.string().min(1, { message: 'Please select a player.' }),
  amount: z.coerce.number()
    .positive({ message: 'Amount must be greater than 0.' })
    .min(1, { message: 'Minimum amount is KES 1.' }),
  paymentMethod: z.enum(['cash', 'mpesa'], {
    required_error: 'Please select a payment method.',
  }),
  phoneNumber: z.string()
    .regex(/^254\d{9}$/, 'Phone number must be in the format 254XXXXXXXXX (e.g., 254712345678).')
    .optional()
    .or(z.literal('')),
  description: z.string().optional(),
});

interface Player {
  id: number;
  name: string;
  position?: string;
  team?: string;
}

export function PaymentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [mpesaConfigured, setMpesaConfigured] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerId: '',
      amount: 5000,
      paymentMethod: 'cash',
      phoneNumber: '254',
      description: '',
    },
  });

  const selectedPaymentMethod = form.watch('paymentMethod');

  useEffect(() => {
    fetchPlayers();
    checkMpesaConfig();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoadingPlayers(true);
      const response = await fetch('/api/players?limit=1000');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.players) {
          setPlayers(data.data.players);
        } else {
          setPlayers([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch players:', error);
      toast({
        title: 'Error',
        description: 'Failed to load players. Please refresh the page.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPlayers(false);
    }
  };

  const checkMpesaConfig = async () => {
    try {
      setCheckingConfig(true);
      const response = await fetch('/api/finances/mpesa/config');
      if (response.ok) {
        const data = await response.json();
        setMpesaConfigured(data.configured);
        console.log('M-Pesa configured:', data.configured);
      }
    } catch (error) {
      console.error('Failed to check M-Pesa config:', error);
      setMpesaConfigured(false);
    } finally {
      setCheckingConfig(false);
    }
  };

  // Record payment as cash
  const recordCashPayment = async (playerName: string, amount: number, description?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch('/api/finances/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_name: playerName,
        date: today,
        amount: amount,
        type: 'PAYMENT',
        description: description || `Cash payment of KES ${amount} by ${playerName}`,
        status: 'Completed',
        payment_method: 'Cash',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to record payment');
    }

    return data;
  };

  // Send M-Pesa payment
  const sendMpesaPayment = async (playerName: string, amount: number, phoneNumber: string, playerId: number, description?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch('/api/finances/mpesa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_name: playerName,
        amount: amount,
        phone_number: phoneNumber,
        player_id: playerId,
        date: today,
        description: description || `Payment of KES ${amount} by ${playerName}`,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Invalid response from server. Please try again.');
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to initiate M-Pesa payment');
    }

    return data;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      setPaymentStatus('processing');
      
      const selectedPlayer = players.find(p => p.id.toString() === values.playerId);
      
      if (!selectedPlayer) {
        toast({
          title: 'Error',
          description: 'Selected player not found.',
          variant: 'destructive',
        });
        setPaymentStatus('error');
        return;
      }

      // Handle Cash Payment
      if (values.paymentMethod === 'cash') {
        const data = await recordCashPayment(selectedPlayer.name, values.amount, values.description);
        
        if (data.success) {
          setPaymentStatus('success');
          toast({
            title: '✅ Cash Payment Recorded!',
            description: `KES ${values.amount.toLocaleString()} cash payment recorded for ${selectedPlayer.name}`,
            duration: 5000,
          });
          
          form.reset({
            playerId: '',
            amount: 5000,
            paymentMethod: 'cash',
            phoneNumber: '254',
            description: '',
          });
          
          setTimeout(() => setPaymentStatus('idle'), 3000);
          await fetchPlayers();
        }
        return;
      }

      // Handle M-Pesa Payment
      if (values.paymentMethod === 'mpesa') {
        // Validate phone number for M-Pesa
        if (!values.phoneNumber || !values.phoneNumber.match(/^254\d{9}$/)) {
          toast({
            title: 'Validation Error',
            description: 'Please enter a valid phone number for M-Pesa payment.',
            variant: 'destructive',
          });
          setPaymentStatus('error');
          return;
        }

        if (!mpesaConfigured) {
          // Fallback to cash if M-Pesa not configured
          toast({
            title: 'M-Pesa Not Configured',
            description: 'Recording as cash payment instead.',
            duration: 5000,
          });
          
          const data = await recordCashPayment(selectedPlayer.name, values.amount, values.description);
          
          if (data.success) {
            setPaymentStatus('success');
            toast({
              title: '✅ Payment Recorded as Cash',
              description: `KES ${values.amount.toLocaleString()} recorded for ${selectedPlayer.name}`,
              duration: 5000,
            });
            
            form.reset({
              playerId: '',
              amount: 5000,
              paymentMethod: 'cash',
              phoneNumber: '254',
              description: '',
            });
            
            setTimeout(() => setPaymentStatus('idle'), 3000);
            await fetchPlayers();
          }
          return;
        }

        // Send M-Pesa prompt
        try {
          const data = await sendMpesaPayment(
            selectedPlayer.name,
            values.amount,
            values.phoneNumber,
            selectedPlayer.id,
            values.description
          );

          if (data.success) {
            setPaymentStatus('success');
            
            toast({
              title: '📱 M-Pesa Prompt Sent!',
              description: `Please check your phone (${values.phoneNumber}) for the M-Pesa prompt. Enter your PIN to complete the payment of KES ${values.amount.toLocaleString()}.`,
              duration: 15000,
            });
            
            setTimeout(() => {
              toast({
                title: '💡 Important',
                description: 'The payment will be confirmed automatically once you complete the M-Pesa prompt.',
                duration: 8000,
              });
            }, 2000);
            
            form.reset({
              playerId: '',
              amount: 5000,
              paymentMethod: 'cash',
              phoneNumber: '254',
              description: '',
            });
            
            setTimeout(() => setPaymentStatus('idle'), 3000);
            await fetchPlayers();
          }
        } catch (mpesaError: any) {
          console.error('M-Pesa error, falling back to cash:', mpesaError);
          
          toast({
            title: 'M-Pesa Failed, Recording as Cash',
            description: 'M-Pesa service is currently unavailable. Payment recorded as cash.',
            duration: 5000,
          });
          
          const data = await recordCashPayment(selectedPlayer.name, values.amount, values.description);
          
          if (data.success) {
            setPaymentStatus('success');
            form.reset({
              playerId: '',
              amount: 5000,
              paymentMethod: 'cash',
              phoneNumber: '254',
              description: '',
            });
            setTimeout(() => setPaymentStatus('idle'), 3000);
            await fetchPlayers();
          }
        }
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast({
        title: '❌ Payment Failed',
        description: error instanceof Error ? error.message : 'Failed to process payment. Please try again.',
        variant: 'destructive',
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Payment Details</CardTitle>
        <CardDescription>
          Select payment method and enter payment information below.
          {!mpesaConfigured && !checkingConfig && (
            <span className="block mt-1 text-amber-600">
              ⚠️ M-Pesa not configured - only cash payments available
            </span>
          )}
          {checkingConfig && (
            <span className="block mt-1 text-muted-foreground">
              Checking M-Pesa configuration...
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Method Selection */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Payment Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                          <Landmark className="h-4 w-4" />
                          Cash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mpesa" id="mpesa" disabled={!mpesaConfigured} />
                        <Label htmlFor="mpesa" className={`flex items-center gap-2 cursor-pointer ${!mpesaConfigured ? 'text-muted-foreground' : ''}`}>
                          <Smartphone className="h-4 w-4" />
                          M-Pesa {!mpesaConfigured && '(Not Configured)'}
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Player Selection */}
            <FormField
              control={form.control}
              name="playerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Player</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={loadingPlayers || isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingPlayers ? "Loading players..." : "Select a player"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {players.length === 0 ? (
                        <SelectItem value="no-players" disabled>
                          No players found
                        </SelectItem>
                      ) : (
                        players.map((player) => (
                          <SelectItem key={player.id} value={String(player.id)}>
                            {player.name} {player.position ? `(${player.position})` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (KES)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5000" 
                      {...field}
                      min="1"
                      step="1"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Enter the payment amount in Kenyan Shillings (KES)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Monthly training fee, Registration fee, Equipment purchase..."
                      {...field}
                      rows={3}
                      disabled={isSubmitting}
                      className="resize-none"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Add a brief description of what this payment is for
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number - Only show for M-Pesa */}
            {selectedPaymentMethod === 'mpesa' && (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>M-Pesa Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="254712345678" 
                        {...field}
                        maxLength={12}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Format: 254XXXXXXXXX (e.g., 254712345678)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Payment Status Display */}
            {paymentStatus === 'processing' && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                <span className="text-sm text-yellow-700">
                  {selectedPaymentMethod === 'mpesa' ? 'Sending M-Pesa prompt...' : 'Recording cash payment...'}
                </span>
              </div>
            )}
            
            {paymentStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-700">
                  {selectedPaymentMethod === 'mpesa' ? 'M-Pesa prompt sent successfully!' : 'Cash payment recorded successfully!'}
                </span>
              </div>
            )}
            
            {paymentStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700">Payment failed. Please try again.</span>
              </div>
            )}

            {/* M-Pesa Status Warning */}
            {selectedPaymentMethod === 'mpesa' && !mpesaConfigured && !checkingConfig && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-amber-700">
                  M-Pesa not configured. Payment will be recorded as cash.
                </span>
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={isSubmitting || loadingPlayers || checkingConfig}
              className="w-full"
              size="lg"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting 
                ? 'Processing...' 
                : selectedPaymentMethod === 'mpesa' 
                  ? 'Send M-Pesa Payment Prompt' 
                  : 'Record Cash Payment'
              }
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              {selectedPaymentMethod === 'mpesa' 
                ? '🔒 Secure M-Pesa payment via Safaricom Daraja API'
                : '💳 Payment recorded as cash'
              }
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}