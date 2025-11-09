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
import { useToast } from '@/hooks/use-toast';
import type { Budget, TransactionCategory } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

const categories: TransactionCategory[] = ['Food', 'Transport', 'Shopping', 'Housing', 'Health', 'Entertainment', 'Other'];

interface BudgetDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  budget?: Budget;
  month: number;
  year: number;
  existingCategories: string[];
}

export function BudgetDialog({ isOpen, setIsOpen, budget, month, year, existingCategories }: BudgetDialogProps) {
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (budget) {
      setCategory(budget.category as TransactionCategory);
      setAmount(String(budget.amount));
    } else {
      // Find the first available category
      const firstAvailable = categories.find(c => !existingCategories.includes(c));
      setCategory(firstAvailable || 'Food');
      setAmount('');
    }
  }, [budget, isOpen, existingCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    setIsLoading(true);

    const budgetId = budget?.id || `${year}-${month}-${category}`;
    const budgetRef = doc(firestore, 'users', user.uid, 'budgets', budgetId);

    const budgetData = {
      userId: user.uid,
      category,
      amount: parseFloat(amount),
      month,
      year,
    };
    
    try {
      if (!budget && existingCategories.includes(category)) {
          toast({
            variant: 'destructive',
            title: 'Duplicate Budget',
            description: `You already have a budget for the "${category}" category this month.`,
          });
          setIsLoading(false);
          return;
      }
      
      setDocumentNonBlocking(budgetRef, budgetData);
      
      toast({
        title: `Budget ${budget ? 'Updated' : 'Created'}`,
        description: `Your budget for ${category} has been saved.`,
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to save budget.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const availableCategories = budget ? categories : categories.filter(c => !existingCategories.includes(c));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
          <DialogDescription>
            {budget ? 'Update the amount for this budget.' : `Set a spending limit for a category for ${month}/${year}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="budget-form" className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v: TransactionCategory) => setCategory(v)} disabled={!!budget}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {budget ? (
                  <SelectItem value={budget.category}>{budget.category}</SelectItem>
                ) : availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">All categories have budgets.</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 500.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="budget-form" disabled={isLoading || (availableCategories.length === 0 && !budget)}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {budget ? 'Save Changes' : 'Create Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
