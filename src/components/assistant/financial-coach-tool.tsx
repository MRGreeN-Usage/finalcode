'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Bot, Wand2 } from 'lucide-react';
import type { FinancialCoachInput, FinancialCoachOutput } from '@/ai/flows/financial-coach';
import { financialCoach } from '@/ai/flows/financial-coach';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

export function FinancialCoachTool() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<FinancialCoachOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'transactions');
  }, [user, firestore]);

  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const handleAskQuestion = async () => {
    if (!transactions) {
      setError('No transaction data available to analyze. Please add some transactions first.');
      return;
    }
    if (!query) {
      setError('Please enter a question.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const flowTransactions = transactions.map(t => ({
      ...t,
      date: format(new Date(t.date), 'yyyy-MM-dd'),
    }));

    const input: FinancialCoachInput = {
      query,
      transactions: flowTransactions,
    };

    try {
      const result = await financialCoach(input);
      setResponse(result);
    } catch (e) {
      console.error(e);
      setError('An error occurred while getting your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canAsk = !isLoading && !transactionsLoading && query;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ask Your Financial Coach</CardTitle>
          <CardDescription>
            Have a question about your spending? Ask your AI coach for personalized insights. Try "Where can I save money?" or "What was my largest expense last month?".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Type your financial question here..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading || transactionsLoading}
            className="min-h-[100px]"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAskQuestion} disabled={!canAsk} className="w-full sm:w-auto">
            {isLoading || transactionsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bot className="mr-2 h-4 w-4" />
            )}
            {transactionsLoading ? 'Loading Data...' : 'Ask Question'}
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-pulse">
          <Sparkles className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-semibold">Your coach is thinking...</p>
          <p className="text-muted-foreground">Analyzing your data to find the best answer.</p>
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {response && (
        <Card>
            <CardHeader>
                <CardTitle>Your Coach's Answer</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                    <p>{response.answer}</p>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
