'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { fraudDetectionAction } from '@/app/fraud-detection/actions';

const formSchema = z.object({
  transactionData: z.string().min(10, 'Transaction data is required.'),
  playerData: z.string().min(10, 'Player data is required.'),
});

type FormValues = z.infer<typeof formSchema>;

const defaultTransactionData = JSON.stringify(
  [
    { "transactionId": "TXN001", "playerId": 101, "amount": 5000, "type": "fee_payment", "date": "2024-07-01" },
    { "transactionId": "TXN002", "playerId": 102, "amount": 5000, "type": "fee_payment", "date": "2024-07-02" },
    { "transactionId": "TXN003", "playerId": 999, "amount": 75000, "type": "expense_reimbursement", "date": "2024-07-03" }
  ], null, 2);

const defaultPlayerData = JSON.stringify(
  [
    { "playerId": 101, "name": "John Doe", "status": "active" },
    { "playerId": 102, "name": "Jane Smith", "status": "active" }
  ], null, 2);


export function FraudDetector() {
  const [result, setResult] = useState<{ isFraudulent: boolean; fraudulentReason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionData: defaultTransactionData,
      playerData: defaultPlayerData,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fraudDetectionAction(values);
      if (response) {
        setResult(response);
      }
    } catch (error) {
      console.error(error);
      setResult({ isFraudulent: true, fraudulentReason: 'An error occurred during analysis.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Analysis Tool</CardTitle>
        <CardDescription>
          Paste transaction and player data in JSON format to begin analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="transactionData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Data</FormLabel>
                    <FormControl>
                      <Textarea placeholder='e.g., [{"transactionId": "TXN001", ...}]' {...field} rows={10} className="font-mono text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="playerData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Data</FormLabel>
                    <FormControl>
                      <Textarea placeholder='e.g., [{"playerId": 101, ...}]' {...field} rows={10} className="font-mono text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? 'Analyzing...' : 'Analyze Data'}
            </Button>
          </form>
        </Form>

        {result && (
          <Alert variant={result.isFraudulent ? 'destructive' : 'default'} className="mt-8">
            {result.isFraudulent ? <AlertCircle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            <AlertTitle className="font-headline">
              {result.isFraudulent ? 'Potential Fraud Detected' : 'No Fraud Detected'}
            </AlertTitle>
            <AlertDescription>{result.fraudulentReason}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
