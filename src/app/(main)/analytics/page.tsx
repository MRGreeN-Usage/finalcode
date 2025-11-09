'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { useCurrency } from '@/hooks/use-currency';

export default function AnalyticsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { format: formatCurrency, formatShort } = useCurrency();

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));
  }, [user, firestore]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const thirtyDayTrendData = useMemo(() => {
    if (!transactions) return [];
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dailyExpenses = transactions
        .filter(t => t.type === 'expense' && format(new Date(t.date), 'yyyy-MM-dd') === dayStr)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        date: format(day, 'MMM d'),
        expenses: dailyExpenses,
      };
    });
  }, [transactions]);
  
  const categorySpendingData = useMemo(() => {
    if (!transactions) return [];
    const currentMonthStart = startOfMonth(new Date());
    const monthlyExpenses = transactions.filter(t => new Date(t.date) >= currentMonthStart && t.type === 'expense');

    const spending = monthlyExpenses.reduce((acc, t) => {
        if (!acc[t.category]) {
            acc[t.category] = 0;
        }
        acc[t.category] += t.amount;
        return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(spending)
        .map(([name, total]) => ({ name, total }))
        .sort((a,b) => b.total - a.total);
  }, [transactions]);

  const monthlyComparison = useMemo(() => {
    if(!transactions) return { currentMonth: 0, lastMonth: 0, change: 0, changeType: 'same' };

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);

    const currentMonthExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= currentMonthStart)
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= lastMonthStart && new Date(t.date) <= lastMonthEnd)
      .reduce((sum, t) => sum + t.amount, 0);
      
    let change = 0;
    if (lastMonthExpenses > 0) {
        change = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    } else if (currentMonthExpenses > 0) {
        change = 100;
    }
    
    const changeType = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'same';

    return {
        currentMonth: currentMonthExpenses,
        lastMonth: lastMonthExpenses,
        change,
        changeType
    }
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spending Analytics</h1>
          <p className="text-muted-foreground">An in-depth look at your financial habits.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>30-Day Spending Trend</CardTitle>
                <CardDescription>Your daily expenses over the last month.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full">
                {isLoading ? <Skeleton className="h-full w-full" /> : (
                    <ChartContainer config={{}} className="w-full h-full">
                        <LineChart data={thirtyDayTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => formatShort(v)} fontSize={12} />
                            <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                            <Line dataKey="expenses" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                )}
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Current vs. previous month's spending.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-40 w-full" /> : (
                <div className="flex flex-col justify-center h-full gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">This Month ({format(new Date(), 'MMMM')})</p>
                        <p className="text-2xl font-bold">{formatCurrency(monthlyComparison.currentMonth)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Last Month ({format(subMonths(new Date(), 1), 'MMMM')})</p>
                        <p className="text-2xl font-bold">{formatCurrency(monthlyComparison.lastMonth)}</p>
                    </div>
                     <div className="flex items-center gap-2">
                        {monthlyComparison.changeType === 'increase' && <ArrowUp className="h-5 w-5 text-destructive" />}
                        {monthlyComparison.changeType === 'decrease' && <ArrowDown className="h-5 w-5 text-primary" />}
                        {monthlyComparison.changeType === 'same' && <Minus className="h-5 w-5 text-muted-foreground" />}
                        <p className={`text-lg font-semibold ${monthlyComparison.changeType === 'increase' ? 'text-destructive' : monthlyComparison.changeType === 'decrease' ? 'text-primary' : 'text-muted-foreground'}`}>
                           {monthlyComparison.change.toFixed(1)}%
                           <span className="text-sm font-normal ml-1">{monthlyComparison.changeType}</span>
                        </p>
                    </div>
                </div>
                )}
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Spending by category for {format(new Date(), 'MMMM yyyy')}.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-[300px] w-full">
            {isLoading ? <Skeleton className="w-full h-full" /> : (
                 <ChartContainer config={{}} className="w-full h-full">
                    <BarChart data={categorySpendingData} layout="vertical" margin={{ left: 10, right: 30 }}>
                        <CartesianGrid horizontal={false} />
                        <XAxis type="number" tickFormatter={(v) => formatShort(v)} />
                        <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false}/>
                        <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--muted))'}}/>
                        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ChartContainer>
            )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
