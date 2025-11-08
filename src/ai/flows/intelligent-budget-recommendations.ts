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
  prompt: `You are a personal finance advisor. Analyze the user's past spending habits and provide personalized budget recommendations.

  Consider the user's monthly income: {{{monthlyIncome}}}.

  Here are the user's recent transactions:
  {{#each transactions}}
  - Category: {{this.category}}, Amount: {{this.amount}}
  {{/each}}

  Based on this data, provide specific and actionable recommendations for optimizing their budget. For each recommendation, include the category, the recommended budget amount, and a clear explanation of why this change is suggested. The goal is to help the user identify potential savings and make informed decisions about their spending habits.

  Ensure that your recommendations are realistic and take into account current market prices and the users individual needs. Try to identify saving oppurtunities by reallocating funds across categories.

  Format your response as a JSON object with an array of recommendations.
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
