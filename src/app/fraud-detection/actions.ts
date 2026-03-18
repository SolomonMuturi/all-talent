'use server';

import { fraudDetectionAndAlerting } from '@/ai/flows/fraud-detection-and-alerting';
import { z } from 'zod';

const formSchema = z.object({
  transactionData: z.string(),
  playerData: z.string(),
});

export async function fraudDetectionAction(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      isFraudulent: true,
      fraudulentReason: 'Invalid input data.',
    };
  }

  try {
    const result = await fraudDetectionAndAlerting(validatedFields.data);
    return result;
  } catch (error) {
    console.error('Fraud detection AI flow failed:', error);
    return {
      isFraudulent: true,
      fraudulentReason: 'The AI analysis service is currently unavailable. Please try again later.',
    };
  }
}
