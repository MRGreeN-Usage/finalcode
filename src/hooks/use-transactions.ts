// This is a placeholder hook. In a real application, you would use
// Firebase's `onSnapshot` to get real-time updates for transactions.

import { useState, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 25 }, (_, i) => {
    const type = Math.random() > 0.2 ? 'expense' : 'income';
    const categories = ['Food', 'Transport', 'Shopping', 'Housing', 'Health', 'Entertainment', 'Other'];
    const date = new Date(2024, 4, Math.floor(Math.random() * 30) + 1);
    return {
        id: `tx_${i}`,
        userId: 'mock-user-id',
        type,
        amount: type === 'income' ? (Math.random() * 1000 + 1500) : (Math.random() * 200 + 5),
        category: type === 'income' ? 'Income' : categories[Math.floor(Math.random() * categories.length)] as any,
        description: `Mock transaction ${i + 1}`,
        date: date.toISOString(),
    };
});

export const useTransactions = (currentMonth: Date) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data for the current month
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const filtered = MOCK_TRANSACTIONS.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= start && txDate <= end;
    });

    const timer = setTimeout(() => {
        setTransactions(filtered);
        setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentMonth]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    console.log('Adding transaction:', transaction);
    // In a real app, you would add this to Firestore
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    console.log(`Updating transaction ${id} with:`, updates);
     // In a real app, you would update this in Firestore
  };

  const deleteTransaction = async (id: string) => {
    console.log(`Deleting transaction ${id}`);
    // In a real app, you would delete this from Firestore
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction };
};
