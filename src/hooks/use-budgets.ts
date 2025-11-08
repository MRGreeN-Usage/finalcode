// This is a placeholder hook. In a real application, you would use
// Firebase's `onSnapshot` to get real-time updates for budgets.

import { useState, useEffect } from 'react';
import type { Budget } from '@/lib/types';
import { format } from 'date-fns';

const MOCK_BUDGETS: Budget[] = [
    { id: '1', userId: '1', category: 'Food', amount: 500, month: '2024-05' },
    { id: '2', userId: '1', category: 'Shopping', amount: 300, month: '2024-05' },
    { id: '3', userId: '1', category: 'Transport', amount: 150, month: '2024-05' },
    { id: '4', userId: '1', category: 'Entertainment', amount: 200, month: '2024-05' },
];

export const useBudgets = (currentMonth: Date) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const monthKey = format(currentMonth, 'yyyy-MM');
    const filtered = MOCK_BUDGETS.filter(b => b.month === monthKey);

    const timer = setTimeout(() => {
        setBudgets(filtered);
        setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentMonth]);

  const setBudget = async (budget: Omit<Budget, 'id' | 'userId' | 'month'>) => {
    console.log('Setting budget:', budget);
    // In a real app, you would add/update this in Firestore
  };

  const deleteBudget = async (id: string) => {
    console.log(`Deleting budget ${id}`);
    // In a real app, you would delete this from Firestore
  };

  return { budgets, loading, setBudget, deleteBudget };
};
