'use client';
import { useState } from 'react';
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

// Mock data
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', userId: '1', type: 'expense', amount: 75.50, category: 'Food', description: 'Dinner with friends', date: '2024-05-20T19:00:00Z' },
  { id: '2', userId: '1', type: 'income', amount: 2500, category: 'Income', description: 'Monthly Salary', date: '2024-05-01T09:00:00Z' },
  { id: '3', userId: '1', type: 'expense', amount: 120, category: 'Shopping', description: 'New shoes', date: '2024-05-15T14:30:00Z' },
  { id: '4', userId: '1', type: 'expense', amount: 42.10, category: 'Transport', description: 'Gasoline', date: '2024-05-18T08:00:00Z' },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);

  const handleAddTransaction = () => {
    setSelectedTransaction(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };
  
  const handleSaveTransaction = (transaction: Transaction) => {
    if (selectedTransaction) {
      setTransactions(transactions.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions([...transactions, { ...transaction, id: Date.now().toString() }]);
    }
  };
  
  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportToCsv(transactions, 'transactions.csv')}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToTxt(transactions, 'transactions.txt', 'Transaction Report')}>Export as TXT</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddTransaction} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      <TransactionTable
        transactions={transactions}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
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
