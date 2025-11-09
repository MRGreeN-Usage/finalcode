'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Wallet } from 'lucide-react';
import type { Budget } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';

interface BudgetListProps {
  budgets: Budget[];
  spending: Record<string, number>;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function BudgetList({ budgets, spending, onEdit, onDelete, isLoading }: BudgetListProps) {
    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                           <Skeleton className="h-6 w-24" />
                           <Skeleton className="h-8 w-8" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-baseline">
                               <Skeleton className="h-8 w-28" />
                               <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-2 w-full" />
                        </CardContent>
                        <CardFooter>
                           <Skeleton className="h-4 w-36" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )
    }

  if (budgets.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Wallet className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardHeader className="p-0">
          <CardTitle>No Budgets Set</CardTitle>
          <CardDescription className="mt-2">Get started by setting your first spending budget for this month.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => {
        const spent = spending[budget.category] || 0;
        const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 100;
        const remaining = budget.amount - spent;

        return (
          <Card key={budget.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{budget.category}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="-mt-2 -mr-2 h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(budget)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(budget.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <div className="flex justify-between items-baseline">
                <div className="text-3xl font-bold">${spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div className="text-sm text-muted-foreground">of ${budget.amount.toLocaleString('en-US')}</div>
               </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
            <CardFooter>
              <p className={`text-sm ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {remaining >= 0 ? `$${remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2})} remaining` : `$${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2})} over budget`}
              </p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
