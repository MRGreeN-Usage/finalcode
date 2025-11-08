'use client';
import { useState, useEffect, useMemo } from 'react';
import { CategoryPieChart } from '@/components/reports/category-pie-chart';
import { SpendingBarChart } from '@/components/reports/spending-bar-chart';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { addMonths, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { exportToCsv, exportToTxt } from '@/lib/helpers';
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );
  }, [user, firestore]);

  const { data: allTransactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const monthTransactions = useMemo(() => {
    if (!allTransactions || !currentMonth) return [];
    const monthKey = format(currentMonth, 'yyyy-MM');
    return allTransactions.filter(t => format(new Date(t.date), 'yyyy-MM') === monthKey);
  }, [allTransactions, currentMonth]);

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => (prev ? addMonths(prev, direction === 'next' ? 1 : -1) : new Date()));
  };

  const formattedMonth = currentMonth ? format(currentMonth, 'MMMM yyyy') : '...';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">Visualize your spending for {formattedMonth}</p>
        </div>
        <div className="flex items-center gap-2">
            {currentMonth ? (
            <MonthSelector currentMonth={currentMonth} onMonthChange={handleMonthChange} />
            ) : (
            <Skeleton className="h-8 w-[170px]" />
            )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
            <Button 
                variant="outline"
                onClick={() => monthTransactions && exportToCsv(monthTransactions, `transactions-${format(currentMonth!, 'yyyy-MM')}.csv`)}
                disabled={!monthTransactions || monthTransactions.length === 0}
            >
                Export as CSV
            </Button>
            <Button 
                variant="outline"
                onClick={() => monthTransactions && exportToTxt(monthTransactions, `transactions-${format(currentMonth!, 'yyyy-MM')}.txt`, 'Transaction Report')}
                disabled={!monthTransactions || monthTransactions.length === 0}
            >
                Export as TXT
            </Button>
        </CardContent>
      </Card>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CategoryPieChart transactions={monthTransactions} isLoading={transactionsLoading} />
        </div>
        <div className="lg:col-span-3">
          <SpendingBarChart transactions={monthTransactions} isLoading={transactionsLoading} />
        </div>
      </div>
      <div className="grid grid-cols-1">
        <IncomeExpenseChart transactions={allTransactions || []} title="Income vs Expenses Trend (Yearly)"/>
      </div>
    </div>
  );
}
