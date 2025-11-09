'use client';
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Edit, Utensils, Car, ShoppingBag, HeartPulse, Building, Gamepad2, Briefcase, Wallet } from 'lucide-react';
import type { Budget, Transaction, TransactionCategory } from '@/lib/types';
import { useCurrency } from '@/hooks/use-currency';
import { Skeleton } from '../ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser, useFirestore, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { BudgetDialog } from './budget-dialog';

const categoryIcons: Record<TransactionCategory, React.ElementType> = {
    'Food': Utensils,
    'Transport': Car,
    'Shopping': ShoppingBag,
    'Housing': Building,
    'Health': HeartPulse,
    'Entertainment': Gamepad2,
    'Income': Briefcase,
    'Other': Wallet,
};

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
  isLoading: boolean;
}

export function BudgetList({ budgets, transactions, isLoading }: BudgetListProps) {
  const { format } = useCurrency();
  const firestore = useFirestore();
  const { user } = useUser();

  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (!user || !firestore) return;
    const budgetRef = doc(firestore, 'users', user.uid, 'budgets', id);
    deleteDocumentNonBlocking(budgetRef);
    setDeletingBudgetId(null);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsEditDialogOpen(true);
  };

  const aggregatedBudgets = useMemo(() => {
    return budgets.map(budget => {
      const spent = transactions
        .filter(t => t.category === budget.category && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
      const remaining = budget.amount - spent;
      const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return { ...budget, spent, remaining, progress };
    });
  }, [budgets, transactions]);
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardHeader><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-4 w-40" /></CardHeader><CardContent><Skeleton className="h-5 w-3/4 mb-2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-5 w-1/2 mt-2" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (aggregatedBudgets.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 py-20 text-center">
            <Wallet className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-6 text-xl font-semibold">No Budgets Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Create a budget to start tracking your spending.</p>
        </div>
    )
  }

  return (
    <>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {aggregatedBudgets.map(budget => {
        const Icon = categoryIcons[budget.category as TransactionCategory] || Wallet;
        const progressColor = budget.progress > 100 ? 'bg-destructive' : 'bg-primary';

        return (
          <Card key={budget.id} className="flex flex-col transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                  <CardTitle className="text-lg font-medium">{budget.category}</CardTitle>
              </div>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(budget)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeletingBudgetId(budget.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-2xl font-bold">{format(budget.amount)}</div>
              <p className="text-xs text-muted-foreground">Budgeted</p>
              <div className="mt-4">
                 <Progress value={Math.min(budget.progress, 100)} className="h-2" indicatorClassName={progressColor}/>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Spent: {format(budget.spent)}</span>
                  <span>{budget.progress.toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
                 <p className={`text-sm font-medium ${budget.remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {budget.remaining >= 0 ? `${format(budget.remaining)} remaining` : `${format(Math.abs(budget.remaining))} overspent`}
                 </p>
            </CardFooter>
          </Card>
        );
      })}
    </div>

    {editingBudget && (
      <BudgetDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          budget={editingBudget}
          month={editingBudget.month}
          year={editingBudget.year}
          existingCategories={budgets.map(b => b.category)}
      />
    )}

    <AlertDialog open={!!deletingBudgetId} onOpenChange={() => setDeletingBudgetId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This will permanently delete your budget for this category. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(deletingBudgetId!)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

// Custom indicator for progress bar to allow changing color
declare module "@radix-ui/react-progress" {
    interface ProgressIndicatorProps {
        indicatorClassName?: string;
    }
}

// Override Progress component to accept indicatorClassName
const OriginalProgress = Progress;
const CustomProgress = React.forwardRef<
    React.ElementRef<typeof OriginalProgress>,
    React.ComponentPropsWithoutRef<typeof OriginalProgress> & { indicatorClassName?: string }
>(({ indicatorClassName, ...props }, ref) => (
    <OriginalProgress
        ref={ref}
        {...props}
        // @ts-ignore
        indicatorClassName={indicatorClassName}
    />
));
CustomProgress.displayName = 'Progress';
export { CustomProgress as Progress };
