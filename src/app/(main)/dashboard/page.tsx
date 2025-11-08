'use client';

import { useState, useEffect } from 'react';
import { DashboardCards } from '@/components/dashboard/dashboard-cards';
import { IncomeExpenseChart } from '@/components/dashboard/income-expense-chart';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { addMonths, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => (prev ? addMonths(prev, direction === 'next' ? 1 : -1) : new Date()));
  };

  const formattedMonth = currentMonth ? format(currentMonth, 'MMMM yyyy') : '...';

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
            <Skeleton className="h-8 w-[170px]" />
        )}
      </div>

      <DashboardCards month={formattedMonth} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <IncomeExpenseChart month={formattedMonth} />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
