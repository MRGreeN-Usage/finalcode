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
import { useToast } from '@/hooks/use-toast';

const budgetCategories: Exclude<TransactionCategory, 'Income'>[] = ['Food', 'Transport', 'Shopping', 'Housing', 'Health', 'Entertainment', 'Other'];

interface BudgetDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (budget: { category: Exclude<TransactionCategory, 'Income'>; amount: number }) => void;
  budget?: Budget;
  existingCategories?: string[];
}

export function BudgetDialog({ isOpen, setIsOpen, onSave, budget, existingCategories = [] }: BudgetDialogProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Exclude<TransactionCategory, 'Income'>>('Food');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const availableCategories = budget
    ? budgetCategories
    : budgetCategories.filter(c => !existingCategories.includes(c));

  useEffect(() => {
    if (budget) {
      setAmount(budget.amount.toString());
      setCategory(budget.category);
    } else {
      setAmount('');
      setCategory(availableCategories[0] || 'Food');
    }
  }, [budget, isOpen, availableCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave({
        category,
        amount: parseFloat(amount),
      });
      toast({
        title: `Budget ${budget ? 'updated' : 'added'}`,
        description: `Successfully ${budget ? 'updated' : 'added'} budget for ${category}.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to save budget.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
          <DialogDescription>
            {budget ? 'Update the details of your budget.' : 'Set a new budget for a category.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="budget-form" className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value: Exclude<TransactionCategory, 'Income'>) => setCategory(value)} disabled={!!budget}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="None" disabled>All categories have budgets</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input id="amount" type="number" placeholder="e.g., 500" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="budget-form" disabled={isLoading || availableCategories.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
