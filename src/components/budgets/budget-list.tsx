'use client';

import type { Budget, Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BudgetListProps {
  budgets: Budget[];
  transactions: Transaction[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function BudgetList({ budgets, transactions, onEdit, onDelete, isLoading }: BudgetListProps) {
  const spendingByCategory = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (acc[tx.category]) {
        acc[tx.category] += tx.amount;
      } else {
        acc[tx.category] = tx.amount;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-8" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-5 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center">
        <h3 className="text-xl font-semibold tracking-tight">No Budgets Found</h3>
        <p className="text-muted-foreground">
          Get started by creating a budget for a spending category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => {
        const spent = spendingByCategory[budget.category] || 0;
        const remaining = budget.amount - spent;
        const progress = (spent / budget.amount) * 100;

        return (
          <Card key={budget.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">{budget.category}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Budget: ${budget.amount.toLocaleString()}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(budget)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(budget.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progress > 100 ? 100 : progress} className={progress > 100 ? '[&>div]:bg-destructive' : ''} />
              <div className="flex justify-between text-sm">
                <p className="text-muted-foreground">Spent</p>
                <p>${spent.toLocaleString()}</p>
              </div>
            </CardContent>
            <CardFooter>
                {remaining >= 0 ? (
                    <p className="text-sm text-primary">
                        ${remaining.toLocaleString()} remaining
                    </p>
                ) : (
                    <p className="text-sm text-destructive">
                        ${Math.abs(remaining).toLocaleString()} over budget
                    </p>
                )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
