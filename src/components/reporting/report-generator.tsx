'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, FileText, Sparkles } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { generateReportSummaryAction } from '@/app/reporting/actions';

const formSchema = z.object({
  reportData: z.string().min(20, 'Report data must be at least 20 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

const defaultReportData = JSON.stringify(
  {
    "period": "July 2024",
    "financialSummary": {
      "totalRevenue": 250000,
      "totalExpenses": 185000,
      "netProfit": 65000
    },
    "playerPerformance": {
      "topScorer": "Leo Wanjala",
      "mostAssists": "Aisha Akinyi",
      "highestAttendance": "Fatima Omar"
    }
  }, null, 2);

export function ReportGenerator() {
  const [result, setResult] = useState<{ summary: string; error: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportData: defaultReportData,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateReportSummaryAction(values);
      if (response) {
        setResult(response);
      }
    } catch (error) {
      console.error(error);
      setResult({ summary: '', error: 'An unexpected error occurred during analysis.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Report Summary Generator</CardTitle>
        <CardDescription>
          Paste your report data in JSON format to generate a concise summary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="reportData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Data</FormLabel>
                  <FormControl>
                    <Textarea placeholder='e.g., {"period": "July 2024", ...}' {...field} rows={12} className="font-mono text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate Summary'}
            </Button>
          </form>
        </Form>

        {result?.summary && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <FileText className="size-5" />
                Generated Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{result.summary}</p>
            </CardContent>
          </Card>
        )}

        {result?.error && (
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
