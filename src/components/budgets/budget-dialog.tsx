'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Budget, TransactionCategory } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const categories: Exclude<TransactionCategory, 'Income'>[] = ['Food', 'Transport', 'Shopping', 'Housing', 'Health', 'Entertainment', 'Other'];

interface BudgetDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (budget: Budget) => void;
  budget?: Budget;
  existingCategories: string[];
}

export function BudgetDialog({ isOpen, setIsOpen, onSave, budget, existingCategories }: BudgetDialogProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (budget) {
      setAmount(budget.amount.toString());
      setCategory(budget.category);
    } else {
      setAmount('');
      setCategory('Food');
    }
  }, [budget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSave({
      id: budget?.id || Date.now().toString(),
      userId: budget?.userId || 'mock-user-id',
      category: category as Exclude<TransactionCategory, 'Income'>,
      amount: parseFloat(amount),
      month: budget?.month || format(new Date(), 'yyyy-MM'),
    });

    setIsLoading(false);
    setIsOpen(false);
  };
  
  const availableCategories = budget ? categories : categories.filter(c => !existingCategories.includes(c));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Set Budget'}</DialogTitle>
          <DialogDescription>
            {budget ? `Update your budget for ${budget.category}.` : 'Create a new budget for a category.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="budget-form" className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(value: TransactionCategory) => setCategory(value)} disabled={!!budget}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="amount">Budget Amount</Label>
                    <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </div>
            </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="budget-form" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
