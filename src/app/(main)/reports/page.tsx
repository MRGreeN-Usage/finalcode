'use client';
import { useState } from 'react';
import { CategoryPieChart } from '@/components/reports/category-pie-chart';
import { SpendingBarChart } from '@/components/reports/spending-bar-chart';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { addMonths, format } from 'date-fns';

export default function ReportsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => addMonths(prev, direction === 'next' ? 1 : -1));
  };
  
  const formattedMonth = format(currentMonth, "MMMM yyyy");
    
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Visualize your spending for {formattedMonth}</p>
        </div>
        <MonthSelector 
          currentMonth={currentMonth} 
          onMonthChange={handleMonthChange}
        />
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
