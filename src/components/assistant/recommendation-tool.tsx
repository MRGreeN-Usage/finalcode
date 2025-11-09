'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Wand2, CheckCircle } from 'lucide-react';
import type { IntelligentBudgetRecommendationsInput, IntelligentBudgetRecommendationsOutput } from '@/ai/flows/intelligent-budget-recommendations';
import { intelligentBudgetRecommendations } from '@/ai/flows/intelligent-budget-recommendations';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useCurrency } from '@/hooks/use-currency';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';

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
  const [appliedBudgets, setAppliedBudgets] = useState<string[]>([]);
  const { format: formatCurrency } = useCurrency();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    setAppliedBudgets([]);

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

  const handleApplyBudget = (category: string, amount: number) => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to apply a budget.' });
        return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const budgetId = `${year}-${month}-${category}`;
    const budgetRef = doc(firestore, 'users', user.uid, 'budgets', budgetId);

    const budgetData = {
        userId: user.uid,
        category,
        amount,
        month,
        year,
    };

    setDocumentNonBlocking(budgetRef, budgetData, { merge: true });

    toast({
        title: 'Budget Applied!',
        description: `Your new budget of ${formatCurrency(amount)} for ${category} has been saved.`,
    });
    setAppliedBudgets(prev => [...prev, category]);
  }

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
                    <h2 className="text-xl font-bold">Your AI-Powered Budget Plan for {format(new Date(), 'MMMM yyyy')}</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {recommendations.recommendations.map((rec, index) => {
                            const isApplied = appliedBudgets.includes(rec.category);
                            return (
                                <Card key={index} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{rec.category}</CardTitle>
                                        <CardDescription>Recommended Budget</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-4">
                                        <p className="text-3xl font-bold text-primary">{formatCurrency(rec.recommendedBudget)}</p>
                                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button 
                                            onClick={() => handleApplyBudget(rec.category, rec.recommendedBudget)}
                                            disabled={isApplied}
                                            className="w-full"
                                        >
                                            {isApplied ? (
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                            ) : null}
                                            {isApplied ? 'Applied' : 'Apply Budget'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )
                        })}
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
