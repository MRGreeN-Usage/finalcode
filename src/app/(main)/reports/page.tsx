'use client';
import { useState, useEffect } from 'react';
import { CategoryPieChart } from '@/components/reports/category-pie-chart';
import { SpendingBarChart } from '@/components/reports/spending-bar-chart';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { addMonths, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => (prev ? addMonths(prev, direction === 'next' ? 1 : -1) : new Date()));
  };
  
  const formattedMonth = currentMonth ? format(currentMonth, "MMMM yyyy") : '...';
    
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Visualize your spending for {formattedMonth}</p>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
            <CategoryPieChart />
        </div>
        <div className="lg:col-span-3">
            <SpendingBarChart />
        </div>
      </div>
    </div>
  );
}
