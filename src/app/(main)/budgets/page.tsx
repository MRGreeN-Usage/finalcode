'use client';
import { useState, useMemo, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetList } from '@/components/budgets/budget-list';
import { BudgetDialog } from '@/components/budgets/budget-dialog';
import type { Budget, Transaction } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { Skeleton } from '@/components/ui/skeleton';

export default function BudgetsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { user } = useUser();
  const firestore = useFirestore();

  const monthString = format(currentMonth, 'yyyy-MM');

  const budgetsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'budgets'),
      where('month', '==', monthString)
    );
  }, [user, firestore, monthString]);

  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      where('date', '>=', start.toISOString()),
      where('date', '<=', end.toISOString()),
      where('type', '==', 'expense')
    );
  }, [user, firestore, currentMonth]);

  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const handleAddBudget = () => {
    setSelectedBudget(undefined);
    setIsDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };

  const handleSaveBudget = (budgetData: { category: Exclude<Transaction['category'], 'Income'>; amount: number }) => {
    if (!user || !firestore) return;

    const dataToSave = { ...budgetData, month: monthString, userId: user.uid };

    if (selectedBudget) {
      const docRef = doc(firestore, 'users', user.uid, 'budgets', selectedBudget.id);
      updateDocumentNonBlocking(docRef, dataToSave);
    } else {
      const collectionRef = collection(firestore, 'users', user.uid, 'budgets');
      addDocumentNonBlocking(collectionRef, dataToSave);
    }
  };

  const handleDeleteBudget = (id: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'budgets', id);
    deleteDocumentNonBlocking(docRef);
  };

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => addMonths(prev, direction === 'next' ? 1 : -1));
  };
  
  const isLoading = budgetsLoading || transactionsLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage your monthly budgets for {format(currentMonth, 'MMMM yyyy')}
          </p>
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
                <span>Add Budget</span>
            </Button>
        </div>
      </div>

      <BudgetList
        budgets={budgets || []}
        transactions={transactions || []}
        onEdit={handleEditBudget}
        onDelete={handleDeleteBudget}
        isLoading={isLoading}
      />

      <BudgetDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSave={handleSaveBudget}
        budget={selectedBudget}
        existingCategories={budgets?.map(b => b.category) || []}
      />
    </div>
  );
}
