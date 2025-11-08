'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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
                        <CardHeader className="flex flex-row items-start justify-between pb-4">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

  if (budgets.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardHeader>
          <CardTitle>No Budgets Set</CardTitle>
          <CardDescription>Get started by setting your first budget for this month.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => {
        const spent = spending[budget.category] || 0;
        const progress = Math.min((spent / budget.amount) * 100, 100);
        const remaining = budget.amount - spent;

        return (
          <Card key={budget.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-4">
              <div className="space-y-1">
                <CardTitle>{budget.category}</CardTitle>
                <CardDescription>
                  ${spent.toFixed(2)} spent of ${budget.amount.toFixed(2)}
                </CardDescription>
              </div>
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
            <CardContent className="space-y-2">
              <Progress value={progress} />
              <p className={`text-sm font-medium ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {remaining >= 0 ? `$${remaining.toFixed(2)} remaining` : `$${Math.abs(remaining).toFixed(2)} over budget`}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
