export type TransactionCategory = 'Food' | 'Transport' | 'Shopping' | 'Housing' | 'Health' | 'Entertainment' | 'Income' | 'Other';

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: TransactionCategory;
  description: string;
  date: string; // ISO string
  receiptUrl?: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: Exclude<TransactionCategory, 'Income'>;
  amount: number;
  month: string; // YYYY-MM format
}

export type PieChartData = {
  name: string;
  value: number;
  fill: string;
};

export type BarChartData = {
  name: string;
  total: number;
};
