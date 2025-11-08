'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function SpendingBarChart({ transactions, isLoading }: { transactions: Transaction[], isLoading: boolean }) {
  
  const barData = useMemo(() => {
    if (!transactions) return [];

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const spending = expenseTransactions.reduce((acc, t) => {
      if (acc[t.category]) {
        acc[t.category] += t.amount;
      } else {
        acc[t.category] = t.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(spending).map(([name, total]) => ({ name, total }));

  }, [transactions]);


  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full flex items-end gap-2">
                    <Skeleton className="h-full w-8" />
                    <Skeleton className="h-3/4 w-8" />
                    <Skeleton className="h-1/2 w-8" />
                    <Skeleton className="h-full w-8" />
                    <Skeleton className="h-2/3 w-8" />
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Spending</CardTitle>
        <CardDescription>Your total expenses by category this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
        {barData.length > 0 ? (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart data={barData} accessibilityLayer>
                <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                No expense data for this month.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
