'use server';

/**
 * @fileOverview This file contains the Genkit flow for a conversational financial coach.
 *
 * It uses AI to analyze past transaction data and answer user questions about their finances.
 *
 * - financialCoach - A function that takes a user's query and transaction data as input and returns a conversational response.
 * - FinancialCoachInput - The input type for the financialCoach function.
 * - FinancialCoachOutput - The return type for the financialCoach function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionSchema = z.object({
  category: z.string(),
  amount: z.number(),
  date: z.string(),
  description: z.string(),
  type: z.enum(['income', 'expense']),
});

const FinancialCoachInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('Array of user transactions.'),
  query: z.string().describe('The user\'s financial question.'),
});
export type FinancialCoachInput = z.infer<typeof FinancialCoachInputSchema>;

const FinancialCoachOutputSchema = z.object({
  answer: z.string().describe('The conversational answer to the user\'s question.'),
});
export type FinancialCoachOutput = z.infer<typeof FinancialCoachOutputSchema>;

export async function financialCoach(
  input: FinancialCoachInput
): Promise<FinancialCoachOutput> {
  return financialCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialCoachPrompt',
  input: { schema: FinancialCoachInputSchema },
  output: { schema: FinancialCoachOutputSchema },
  prompt: `You are a friendly and encouraging personal finance coach. Your goal is to help the user understand their spending habits and make smarter financial decisions.

  The user has asked the following question:
  "{{{query}}}"

  Here is a list of the user's recent transactions to provide context for your answer:
  {{#each transactions}}
  - Date: {{this.date}}, Type: {{this.type}}, Category: {{this.category}}, Amount: {{this.amount}}, Description: {{this.description}}
  {{/each}}

  Based on their question and their transaction history, provide a clear, helpful, and conversational answer. If their question is vague, try to provide actionable insights based on the data you see. For example, if they ask "how am I doing?", you could analyze their income vs. expenses and highlight their top spending categories. Always be positive and empowering.
  `,
});

const financialCoachFlow = ai.defineFlow(
  {
    name: 'financialCoachFlow',
    inputSchema: FinancialCoachInputSchema,
    outputSchema: FinancialCoachOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
