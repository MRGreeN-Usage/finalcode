'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { addMonths, format } from 'date-fns';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Budget, Transaction } from '@/lib/types';
import { BudgetList } from '@/components/budgets/budget-list';
import { BudgetDialog } from '@/components/budgets/budget-dialog';

export default function BudgetsPage() {
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const monthYear = useMemo(() => {
    if (!currentMonth) return { month: 0, year: 0 };
    return {
      month: currentMonth.getMonth() + 1,
      year: currentMonth.getFullYear(),
    };
  }, [currentMonth]);
  
  const budgetsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !currentMonth) return null;
    return query(
      collection(firestore, 'users', user.uid, 'budgets'),
      where('month', '==', monthYear.month),
      where('year', '==', monthYear.year)
    );
  }, [user, firestore, currentMonth, monthYear]);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !currentMonth) return null;
    const start = new Date(monthYear.year, monthYear.month - 1, 1);
    const end = new Date(monthYear.year, monthYear.month, 0);
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      where('date', '>=', start.toISOString()),
      where('date', '<=', end.toISOString())
    );
  }, [user, firestore, currentMonth, monthYear]);
  
  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);
  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => (prev ? addMonths(prev, direction === 'next' ? 1 : -1) : new Date()));
  };

  const formattedMonth = currentMonth ? format(currentMonth, 'MMMM yyyy') : '...';

  const existingCategories = useMemo(() => budgets?.map(b => b.category) || [], [budgets]);
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Manage your monthly budgets for {formattedMonth}</p>
        </div>
        <div className="flex items-center gap-4">
          {currentMonth ? (
            <MonthSelector 
              currentMonth={currentMonth} 
              onMonthChange={handleMonthChange}
            />
          ) : (
            <Skeleton className="h-8 w-[170px]" />
          )}
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <PlusCircle />
            <span>New Budget</span>
          </Button>
        </div>
      </div>
      
      <BudgetList 
        budgets={budgets || []} 
        transactions={transactions || []} 
        isLoading={budgetsLoading || transactionsLoading}
      />

      {currentMonth && (
        <BudgetDialog 
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          month={monthYear.month}
          year={monthYear.year}
          existingCategories={existingCategories}
        />
      )}
    </div>
  );
}
