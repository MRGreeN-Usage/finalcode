'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { addMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useMemoFirebase, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !currentMonth) return null;
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      where('date', '>=', start.toISOString()),
      where('date', '<=', end.toISOString()),
      orderBy('date', 'desc')
    );
  }, [user, firestore, currentMonth]);

  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => (prev ? addMonths(prev, direction === 'next' ? 1 : -1) : new Date()));
  };

  const formattedMonth = currentMonth ? format(currentMonth, 'MMMM yyyy') : '...';

  const { income, expenses, balance } = useMemo(() => {
    if (!transactions) return { income: 0, expenses: 0, balance: 0 };
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expenses;
    return { income, expenses, balance };
  }, [transactions]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your financial overview for {formattedMonth}</p>
        </div>
        {currentMonth ? (
          <MonthSelector 
            currentMonth={currentMonth} 
            onMonthChange={handleMonthChange}
          />
        ) : (
            <Skeleton className="h-9 w-[200px]" />
        )}
      </div>

      <DashboardCards 
        month={formattedMonth} 
        income={income}
        expenses={expenses}
        balance={balance}
        isLoading={transactionsLoading}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <IncomeExpenseChart transactions={transactions || []} />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions transactions={transactions?.slice(0, 5) || []} isLoading={transactionsLoading} />
        </div>
      </div>
    </div>
  );
}
