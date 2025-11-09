'use server';

/**
 * @fileOverview This file contains the Genkit flow for providing intelligent budget recommendations based on user spending habits.
 *
 * It uses AI to analyze past transaction data and suggest personalized budget optimizations.
 *
 * - intelligentBudgetRecommendations - A function that takes transaction data and monthly income as input and returns budget recommendations.
 * - IntelligentBudgetRecommendationsInput - The input type for the intelligentBudgetRecommendations function.
 * - IntelligentBudgetRecommendationsOutput - The return type for the intelligentBudgetRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  category: z.string(),
  amount: z.number(),
});

const IntelligentBudgetRecommendationsInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('Array of user transactions with category and amount.'),
  monthlyIncome: z.number().describe('The users monthly income'),
});
export type IntelligentBudgetRecommendationsInput = z.infer<
  typeof IntelligentBudgetRecommendationsInputSchema
>;

const RecommendationSchema = z.object({
  category: z.string().describe('The category for the budget recommendation.'),
  recommendedBudget: z.number().describe('The recommended budget amount for the category.'),
  reason: z.string().describe('The reason for the budget recommendation.'),
});

const IntelligentBudgetRecommendationsOutputSchema = z.object({
  recommendations: z.array(RecommendationSchema).describe('An array of budget recommendations.'),
});
export type IntelligentBudgetRecommendationsOutput = z.infer<
  typeof IntelligentBudgetRecommendationsOutputSchema
>;

export async function intelligentBudgetRecommendations(
  input: IntelligentBudgetRecommendationsInput
): Promise<IntelligentBudgetRecommendationsOutput> {
  return intelligentBudgetRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentBudgetRecommendationsPrompt',
  input: {schema: IntelligentBudgetRecommendationsInputSchema},
  output: {schema: IntelligentBudgetRecommendationsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's past spending habits from the last year and provide personalized budget recommendations for the upcoming month.

  The user's stated monthly income is {{{monthlyIncome}}}.

  Here is a list of the user's transactions from the past year:
  {{#each transactions}}
  - Category: {{this.category}}, Amount: {{this.amount}}
  {{/each}}

  Based on this historical data, provide specific and actionable budget recommendations for the main spending categories. The goal is to help the user identify areas where they can save money, optimize their spending, and make informed financial decisions. Your recommendations should be realistic, taking into account their income and past behavior.

  For each recommendation, include:
  1. The spending category.
  2. A recommended budget amount for that category for the next month.
  3. A clear and concise reason for the recommendation, explaining how it's derived from their spending history (e.g., "based on your average spending of X, a budget of Y could save you Z").

  Structure your response as a JSON object containing an array of recommendation objects.
  `,
});

const intelligentBudgetRecommendationsFlow = ai.defineFlow(
  {
    name: 'intelligentBudgetRecommendationsFlow',
    inputSchema: IntelligentBudgetRecommendationsInputSchema,
    outputSchema: IntelligentBudgetRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
