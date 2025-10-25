'use server';

import { generateReportSummary } from '@/ai/flows/automated-report-summary';
import { z } from 'zod';

const formSchema = z.object({
  reportData: z.string().min(10, 'Report data is required.'),
});

export async function generateReportSummaryAction(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      summary: '',
      error: 'Invalid input data.',
    };
  }

  try {
    const result = await generateReportSummary(validatedFields.data);
    return { summary: result.summary, error: null };
  } catch (error) {
    console.error('Report summary AI flow failed:', error);
    return {
      summary: '',
      error: 'The AI analysis service is currently unavailable. Please try again later.',
    };
  }
}
