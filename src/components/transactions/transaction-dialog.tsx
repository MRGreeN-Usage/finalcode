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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Transaction, TransactionCategory, Category } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Loader2, Upload, Check, ChevronsUpDown } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

const defaultCategories: TransactionCategory[] = ['Food', 'Transport', 'Shopping', 'Housing', 'Health', 'Entertainment', 'Other'];

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  transaction?: Transaction;
}

export function TransactionDialog({ isOpen, setIsOpen, onSave, transaction }: TransactionDialogProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);
  const { toast } = useToast();
  
  const { user } = useUser();
  const firestore = useFirestore();

  const categoriesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'categories');
  }, [user, firestore]);

  const { data: customCategories } = useCollection<Category>(categoriesQuery);

  const allCategories = [
    { value: 'Income', label: 'Income' },
    ...defaultCategories.map(c => ({ value: c, label: c })),
    ...(customCategories?.map(c => ({ value: c.name, label: c.name })) || [])
  ].filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i); // Unique categories

  const filteredCategories = type === 'income' 
    ? [{ value: 'Income', label: 'Income' }]
    : allCategories.filter(c => c.value !== 'Income');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(new Date(transaction.date));
    } else {
      setType('expense');
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(new Date());
    }
  }, [transaction, isOpen]);
  
  useEffect(() => {
    if (type === 'income') {
      setCategory('Income');
    } else {
      if (category === 'Income') {
        setCategory('Food');
      }
    }
  }, [type, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        variant: 'destructive',
        title: 'Invalid Date',
        description: 'Please select a date for the transaction.'
      })
      return;
    };
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
      onSave({
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: date.toISOString(),
      });
      toast({
        title: `Transaction ${transaction ? 'updated' : 'added'}`,
        description: `Successfully ${transaction ? 'updated' : 'added'} transaction.`,
      })
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to save transaction.`
      })
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategorySelect = (currentValue: string) => {
    const existingCategory = allCategories.find(c => c.value.toLowerCase() === currentValue.toLowerCase());
    setCategory(existingCategory ? existingCategory.value : currentValue);
    setIsCategoryPopoverOpen(false);
  }

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
            <RadioGroup value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
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
                 <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isCategoryPopoverOpen}
                      className="w-full justify-between"
                      disabled={type==='income'}
                    >
                      {category || "Select category..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command onValueChange={setCategory}>
                      <CommandInput placeholder="Search or add category..." />
                      <CommandList>
                        <CommandEmpty>
                           <Button
                            variant="link"
                            className="w-full h-auto p-2 text-sm"
                            onClick={() => handleCategorySelect(
                              (document.querySelector('[cmdk-input]') as HTMLInputElement)?.value
                            )}
                          >
                            Add new category
                          </Button>
                        </CommandEmpty>
                        <CommandGroup>
                          {filteredCategories.map((cat) => (
                            <CommandItem
                              key={cat.value}
                              value={cat.value}
                              onSelect={handleCategorySelect}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  category === cat.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {cat.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
