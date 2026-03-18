// use server'

/**
 * @fileOverview Fraud detection and alerting flow.
 *
 * - fraudDetectionAndAlerting - A function that identifies and flags potentially fraudulent activities.
 * - FraudDetectionAndAlertingInput - The input type for the fraudDetectionAndAlerting function.
 * - FraudDetectionAndAlertingOutput - The return type for the fraudDetectionAndAlerting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FraudDetectionAndAlertingInputSchema = z.object({
  transactionData: z.string().describe('Financial transaction data in JSON format.'),
  playerData: z.string().describe('Player data in JSON format.'),
});
export type FraudDetectionAndAlertingInput = z.infer<
  typeof FraudDetectionAndAlertingInputSchema
>;

const FraudDetectionAndAlertingOutputSchema = z.object({
  isFraudulent: z.boolean().describe('Whether the activity is potentially fraudulent.'),
  fraudulentReason: z.string().describe('The reason why the activity is flagged as potentially fraudulent.'),
});
export type FraudDetectionAndAlertingOutput = z.infer<
  typeof FraudDetectionAndAlertingOutputSchema
>;

export async function fraudDetectionAndAlerting(
  input: FraudDetectionAndAlertingInput
): Promise<FraudDetectionAndAlertingOutput> {
  return fraudDetectionAndAlertingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fraudDetectionAndAlertingPrompt',
  input: {schema: FraudDetectionAndAlertingInputSchema},
  output: {schema: FraudDetectionAndAlertingOutputSchema},
  prompt: `You are an expert in fraud detection, specializing in identifying fraudulent activities in financial transactions and player data within a football academy context.

  Analyze the provided financial transaction data and player data to identify anomalies and potential fraudulent activities.

  Financial Transaction Data:
  {{transactionData}}

  Player Data:
  {{playerData}}

  Based on your analysis, determine if the activity is potentially fraudulent. If so, provide a clear and concise reason for your determination in the fraudulentReason field.
`,
});

const fraudDetectionAndAlertingFlow = ai.defineFlow(
  {
    name: 'fraudDetectionAndAlertingFlow',
    inputSchema: FraudDetectionAndAlertingInputSchema,
    outputSchema: FraudDetectionAndAlertingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
