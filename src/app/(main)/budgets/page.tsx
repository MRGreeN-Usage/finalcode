'use client';
import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BudgetList } from '@/components/budgets/budget-list';
import { BudgetDialog } from '@/components/budgets/budget-dialog';
import type { Budget } from '@/lib/types';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { addMonths, format } from 'date-fns';

// Mock data
const MOCK_BUDGETS: Budget[] = [
  { id: '1', userId: '1', category: 'Food', amount: 500, month: '2024-05' },
  { id: '2', userId: '1', category: 'Shopping', amount: 300, month: '2024-05' },
  { id: '3', userId: '1', category: 'Transport', amount: 150, month: '2024-05' },
  { id: '4', userId: '1', category: 'Entertainment', amount: 200, month: '2024-05' },
];

// Mock spending data
const MOCK_SPENDING = {
  'Food': 350.75,
  'Shopping': 280.50,
  'Transport': 160.00,
  'Entertainment': 120.00,
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => addMonths(prev, direction === 'next' ? 1 : -1));
  };
  
  const formattedMonth = format(currentMonth, "MMMM yyyy");
  const monthKey = format(currentMonth, "yyyy-MM");

  const handleAddBudget = () => {
    setSelectedBudget(undefined);
    setIsDialogOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };
  
  const handleSaveBudget = (budget: Budget) => {
    if (selectedBudget) {
      setBudgets(budgets.map(b => b.id === budget.id ? budget : b));
    } else {
      setBudgets([...budgets, { ...budget, id: Date.now().toString(), month: monthKey }]);
    }
  };
  
  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Set and track your spending goals for {formattedMonth}.</p>
        </div>
        <div className="flex items-center gap-2">
            <MonthSelector 
            currentMonth={currentMonth} 
            onMonthChange={handleMonthChange}
            />
            <Button onClick={handleAddBudget} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Set Budget</span>
            </Button>
        </div>
      </div>

      <BudgetList
        budgets={budgets.filter(b => b.month === monthKey)}
        spending={MOCK_SPENDING}
        onEdit={handleEditBudget}
        onDelete={handleDeleteBudget}
      />

      <BudgetDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSave={handleSaveBudget}
        budget={selectedBudget}
        existingCategories={budgets.map(b => b.category)}
      />
    </div>
  );
}
