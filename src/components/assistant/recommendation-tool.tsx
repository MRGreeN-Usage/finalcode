'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import type { IntelligentBudgetRecommendationsInput, IntelligentBudgetRecommendationsOutput } from '@/ai/flows/intelligent-budget-recommendations';
import { intelligentBudgetRecommendations } from '@/ai/flows/intelligent-budget-recommendations';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// Mock transactions to simulate fetching user data
const mockTransactions = [
    { category: "Food", amount: 650 },
    { category: "Transport", amount: 250 },
    { category: "Shopping", amount: 800 },
    { category: "Entertainment", amount: 300 },
    { category: "Housing", amount: 1200 },
    { category: "Health", amount: 150 },
];

export function RecommendationTool() {
  const [monthlyIncome, setMonthlyIncome] = useState('5000');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<IntelligentBudgetRecommendationsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const input: IntelligentBudgetRecommendationsInput = {
      monthlyIncome: parseFloat(monthlyIncome),
      transactions: mockTransactions, // In a real app, fetch this from Firestore
    };

    try {
      const result = await intelligentBudgetRecommendations(input);
      setRecommendations(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred while generating recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
            <CardHeader>
            <CardTitle>Analyze Your Spending</CardTitle>
            <CardDescription>
                Enter your monthly income to get started. Our AI will analyze your recent spending and suggest a smarter budget.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <div className="grid gap-4">
                <div className="space-y-2">
                <Label htmlFor="monthly-income">Monthly Income</Label>
                <Input
                    id="monthly-income"
                    type="number"
                    placeholder="e.g., 5000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    disabled={isLoading}
                />
                </div>
            </div>
            </CardContent>
            <CardFooter>
            <Button onClick={handleGetRecommendations} disabled={isLoading || !monthlyIncome} className="w-full">
                {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Recommendations
            </Button>
            </CardFooter>
        </Card>

        <div className="lg:col-span-2">
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full rounded-lg border border-dashed p-8 text-center animate-pulse">
                    <Sparkles className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">Analyzing your financial habits...</p>
                    <p className="text-muted-foreground">Our AI is crafting personalized recommendations for you.</p>
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {recommendations && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Your AI-Powered Budget Plan</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {recommendations.recommendations.map((rec, index) => (
                            <Card key={index} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-lg">{rec.category}</CardTitle>
                                    <CardDescription>Recommended Budget</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <p className="text-3xl font-bold text-primary">${rec.recommendedBudget.toLocaleString()}</p>
                                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && !recommendations && !error && (
                 <div className="flex flex-col items-center justify-center h-full rounded-lg border border-dashed p-8 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">Ready for Financial Clarity?</p>
                    <p className="text-muted-foreground">Enter your income and let our AI assistant guide you toward your financial goals.</p>
                </div>
            )}
        </div>
    </div>
  );
}
