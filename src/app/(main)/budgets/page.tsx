'use client';
import { useState, useEffect, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetList } from '@/components/budgets/budget-list';
import { BudgetDialog } from '@/components/budgets/budget-dialog';
import type { Budget, Transaction } from '@/lib/types';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { addMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';


export default function BudgetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);
  
  const monthKey = currentMonth ? format(currentMonth, "yyyy-MM") : '';

  const budgetsQuery = useMemo(() => {
    if (!user || !monthKey) return null;
    return query(
      collection(firestore, 'users', user.uid, 'budgets'),
      where('month', '==', monthKey)
    );
  }, [user, firestore, monthKey]);
  
  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);

  const transactionsQuery = useMemo(() => {
    if (!user || !currentMonth) return null;
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      where('type', '==', 'expense'),
      where('date', '>=', start.toISOString()),
      where('date', '<=', end.toISOString())
    );
  }, [user, firestore, currentMonth]);
  
  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const spending = useMemo(() => {
    if (!transactions) return {};
    return transactions.reduce((acc, t) => {
      if (acc[t.category]) {
        acc[t.category] += t.amount;
      } else {
        acc[t.category] = t.amount;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [transactions]);

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => (prev ? addMonths(prev, direction === 'next' ? 1 : -1) : new Date()));
  };
  
  const formattedMonth = currentMonth ? format(currentMonth, "MMMM yyyy") : '...';

  const handleAddBudget = () => {
    setSelectedBudget(undefined);
    setIsDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };
  
  const handleSaveBudget = (budgetData: Omit<Budget, 'id' | 'userId'>) => {
    if (!user) return;
    if (selectedBudget) {
      const docRef = doc(firestore, 'users', user.uid, 'budgets', selectedBudget.id);
      updateDocumentNonBlocking(docRef, budgetData);
    } else {
      const collectionRef = collection(firestore, 'users', user.uid, 'budgets');
      addDocumentNonBlocking(collectionRef, { ...budgetData, userId: user.uid });
    }
  };
  
  const handleDeleteBudget = (id: string) => {
    if (!user) return;
    const docRef = doc(firestore, 'users', user.uid, 'budgets', id);
    deleteDocumentNonBlocking(docRef);
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Set and track your spending goals for {formattedMonth}.</p>
        </div>
        <div className="flex items-center gap-2">
            {currentMonth ? (
                <MonthSelector 
                    currentMonth={currentMonth} 
                    onMonthChange={handleMonthChange}
                />
            ) : (
                <Skeleton className="h-8 w-[170px]" />
            )}
            <Button onClick={handleAddBudget} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Set Budget</span>
            </Button>
        </div>
      </div>

      <BudgetList
        budgets={budgets || []}
        spending={spending}
        onEdit={handleEditBudget}
        onDelete={handleDeleteBudget}
        isLoading={budgetsLoading || transactionsLoading}
      />

      <BudgetDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSave={handleSaveBudget}
        budget={selectedBudget}
        existingCategories={budgets?.map(b => b.category) || []}
        currentMonth={currentMonth}
      />
    </div>
  );
}
