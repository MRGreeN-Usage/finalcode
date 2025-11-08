'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { eachWeekOfInterval, startOfMonth, endOfMonth, format, getDay, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--chart-1))',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function IncomeExpenseChart({ transactions, title }: { transactions: Transaction[], title?: string }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      
      const monthTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });

      return {
        date: format(monthStart, 'MMM'),
        income: monthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
        expenses: monthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
      };
    });
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Income vs. Expenses'}</CardTitle>
        <CardDescription>{title ? 'Data for the current year' : 'Weekly breakdown for this month'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value/1000}k`}/>
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line dataKey="income" type="monotone" stroke="var(--color-income)" strokeWidth={2} dot={false} />
              <Line dataKey="expenses" type="monotone" stroke="var(--color-expenses)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
