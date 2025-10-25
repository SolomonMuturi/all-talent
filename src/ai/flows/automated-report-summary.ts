'use server';

/**
 * @fileOverview Automatically generates summaries of financial and player performance reports.
 *
 * - generateReportSummary - A function that generates a summary of the provided report data.
 * - ReportSummaryInput - The input type for the generateReportSummary function.
 * - ReportSummaryOutput - The return type for the generateReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportSummaryInputSchema = z.object({
  reportData: z.string().describe('The financial and player performance report data to summarize.'),
});
export type ReportSummaryInput = z.infer<typeof ReportSummaryInputSchema>;

const ReportSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key trends and insights from the report data.'),
});
export type ReportSummaryOutput = z.infer<typeof ReportSummaryOutputSchema>;

export async function generateReportSummary(input: ReportSummaryInput): Promise<ReportSummaryOutput> {
  return generateReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reportSummaryPrompt',
  input: {schema: ReportSummaryInputSchema},
  output: {schema: ReportSummaryOutputSchema},
  prompt: `You are an expert analyst specializing in summarizing financial and player performance reports for football academies.

You will analyze the provided report data and generate a concise summary of the key trends and insights.

Report Data: {{{reportData}}}`,
});

const generateReportSummaryFlow = ai.defineFlow(
  {
    name: 'generateReportSummaryFlow',
    inputSchema: ReportSummaryInputSchema,
    outputSchema: ReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
