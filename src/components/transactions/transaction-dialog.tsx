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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Transaction, TransactionCategory } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Loader2, Upload } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const categories: TransactionCategory[] = ['Food', 'Transport', 'Shopping', 'Housing', 'Health', 'Entertainment', 'Income', 'Other'];

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (transaction: Transaction) => void;
  transaction?: Transaction;
}

export function TransactionDialog({ isOpen, setIsOpen, onSave, transaction }: TransactionDialogProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(new Date(transaction.date));
    } else {
      // Reset form when opening for a new transaction
      setType('expense');
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(new Date());
    }
  }, [transaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setIsLoading(true);

    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSave({
      id: transaction?.id || Date.now().toString(),
      userId: transaction?.userId || 'mock-user-id',
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: date.toISOString(),
    });
    setIsLoading(false);
    setIsOpen(false);
  };
  
  const filteredCategories = type === 'income' ? ['Income'] : categories.filter(c => c !== 'Income');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          <DialogDescription>
            {transaction ? 'Update the details of your transaction.' : 'Add a new income or expense to your records.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} id="transaction-form" className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Type</Label>
            <RadioGroup defaultValue={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="r-expense" />
                <Label htmlFor="r-expense">Expense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="r-income" />
                <Label htmlFor="r-income">Income</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(value: TransactionCategory) => setCategory(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="e.g., Groceries from Walmart" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt">Receipt (Optional)</Label>
              <Button variant="outline" asChild className="cursor-pointer">
                <label htmlFor="receipt-upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload Image</span>
                </label>
              </Button>
              <Input id="receipt-upload" type="file" className="hidden" />
            </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="transaction-form" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
