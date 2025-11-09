'use client';
import { useState, useMemo, useEffect } from 'react';
import { PlusCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionTable } from '@/components/transactions/transaction-table';
import { TransactionDialog } from '@/components/transactions/transaction-dialog';
import type { Transaction } from '@/lib/types';
import { exportToCsv, exportToTxt } from '@/lib/helpers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, where } from 'firebase/firestore';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { addMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [currentMonth, setCurrentMonth] = useState<Date | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const transactionsQuery = useMemoFirebase(() => {
    if (!user || !firestore || !currentMonth) return null;
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return query(
      collection(firestore, 'users', user.uid, 'transactions'),
      where('date', '>=', start.toISOString()),
      where('date', '<=', end.toISOString()),
      orderBy('date', 'desc')
    );
  }, [user, firestore, currentMonth]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);
  
  const handleMonthChange = (direction: 'next' | 'prev') => {
    setCurrentMonth((prev) => (prev ? addMonths(prev, direction === 'next' ? 1 : -1) : new Date()));
  };

  const formattedMonth = currentMonth ? format(currentMonth, 'MMMM yyyy') : '...';

  const handleAddTransaction = () => {
    setSelectedTransaction(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };
  
  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user || !firestore) return;
    
    if (selectedTransaction) {
      const docRef = doc(firestore, 'users', user.uid, 'transactions', selectedTransaction.id);
      updateDocumentNonBlocking(docRef, transactionData);
    } else {
      const collectionRef = collection(firestore, 'users', user.uid, 'transactions');
      addDocumentNonBlocking(collectionRef, { ...transactionData, userId: user.uid });
    }
  };
  
  const handleDeleteTransaction = (id: string) => {
    if (!user || !firestore) return;
    const docRef = doc(firestore, 'users', user.uid, 'transactions', id);
    deleteDocumentNonBlocking(docRef);
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Your income and expenses for {formattedMonth}.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
           {currentMonth ? (
            <MonthSelector 
              currentMonth={currentMonth} 
              onMonthChange={handleMonthChange}
            />
          ) : (
              <Skeleton className="h-9 w-full sm:w-[200px]" />
          )}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 w-full sm:w-auto" disabled={!transactions || transactions.length === 0}>
                  <FileDown className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => transactions && exportToCsv(transactions, `transactions-${format(currentMonth!, 'yyyy-MM')}.csv`)}>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => transactions && exportToTxt(transactions, `transactions-${format(currentMonth!, 'yyyy-MM')}.txt`, `Transaction Report for ${formattedMonth}`)}>Export as TXT</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={handleAddTransaction} className="gap-2 w-full sm:w-auto">
              <PlusCircle className="h-4 w-4" />
              <span>Add</span>
            </Button>
          </div>
        </div>
      </div>

      <TransactionTable
        transactions={transactions || []}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        isLoading={isLoading}
      />

      <TransactionDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSave={handleSaveTransaction}
        transaction={selectedTransaction}
      />
    </div>
  );
}
