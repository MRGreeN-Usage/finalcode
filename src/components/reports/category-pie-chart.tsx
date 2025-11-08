'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useMemo } from 'react';
import type { Transaction } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

const chartConfig = {
  Food: { label: 'Food', color: 'hsl(var(--chart-1))' },
  Transport: { label: 'Transport', color: 'hsl(var(--chart-2))' },
  Shopping: { label: 'Shopping', color: 'hsl(var(--chart-3))' },
  Housing: { label: 'Housing', color: 'hsl(var(--chart-4))' },
  Health: { label: 'Health', color: 'hsl(var(--chart-5))' },
  Entertainment: { label: 'Entertainment', color: 'hsl(var(--chart-1))' },
  Other: { label: 'Other', color: 'hsl(var(--chart-2))' },
  Income: { label: 'Income', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

export function CategoryPieChart({ transactions, isLoading }: { transactions: Transaction[], isLoading: boolean }) {
  const pieData = useMemo(() => {
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

    return Object.entries(spending).map(([name, value]) => ({
      name,
      value,
      fill: chartConfig[name as keyof typeof chartConfig]?.color || 'hsl(var(--chart-1))'
    }));

  }, [transactions]);
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <Skeleton className="h-48 w-48 rounded-full" />
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense by Category</CardTitle>
        <CardDescription>A breakdown of your spending by category for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
            {pieData.length > 0 ? (
                <ChartContainer config={chartConfig} className="w-full h-full">
                    <PieChart>
                    <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={5}
                        labelLine={false}
                    >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    </PieChart>
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
