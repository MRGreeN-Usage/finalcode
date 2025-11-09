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

export type PieChartData = {
  name: string;
  value: number;
  fill: string;
};

export type BarChartData = {
  name: string;
  total: number;
};

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR';
export type Theme = 'light' | 'dark' | 'auto';

export interface UserPreferences {
    currency: Currency;
    theme: Theme;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    createdAt: any; // serverTimestamp
    preferences?: UserPreferences;
}
