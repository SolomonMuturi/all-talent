'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, FileText, Sparkles, Download, FileDown } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { generateReportSummaryAction } from '@/app/reporting/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  reportData: z.string().min(20, 'Report data must be at least 20 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

const reportTemplates = {
  financial: {
    "period": "July 2024",
    "financialSummary": {
      "totalRevenue": 250000,
      "totalExpenses": 185000,
      "netProfit": 65000,
      "topExpenseCategory": "Field Rental"
    }
  },
  performance: {
    "period": "Q3 2024",
    "playerPerformance": {
      "topScorer": { "name": "Leo Wanjala", "goals": 5 },
      "mostAssists": { "name": "Aisha Akinyi", "assists": 7 },
      "highestAttendance": { "name": "Fatima Omar", "rate": "99%" },
      "mostImprovedPlayer": "David Odhiambo"
    }
  },
  full: {
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
  }
};

export function ReportGenerator() {
  const [result, setResult] = useState<{ summary: string; error: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportData: JSON.stringify(reportTemplates.full, null, 2),
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
  
  const handleTemplateChange = (templateKey: keyof typeof reportTemplates) => {
    form.setValue('reportData', JSON.stringify(reportTemplates[templateKey], null, 2));
  };

  const handleDownload = () => {
    if (!result?.summary) return;
    const blob = new Blob([result.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report-summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Report Summary Generator</CardTitle>
        <CardDescription>
          Select a report template or paste your data in JSON format to generate a concise summary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
                <Label>Report Template</Label>
                <Select onValueChange={(value: keyof typeof reportTemplates) => handleTemplateChange(value)} defaultValue="full">
                    <SelectTrigger>
                        <SelectValue placeholder="Select a report template" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="full">Full Academy Overview</SelectItem>
                        <SelectItem value="financial">Financial Summary</SelectItem>
                        <SelectItem value="performance">Player Performance</SelectItem>
                    </SelectContent>
                </Select>
            </div>
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
            <CardHeader className="flex flex-row items-center">
               <div className="flex-1">
                    <CardTitle className="font-headline flex items-center gap-2">
                        <FileText className="size-5" />
                        Generated Summary
                    </CardTitle>
               </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                    <FileDown className="mr-2 h-4 w-4"/>
                    Download Summary
                </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{result.summary}</p>
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
