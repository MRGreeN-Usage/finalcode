import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, Utensils, Car, ShoppingBag, HeartPulse } from 'lucide-react';
import Link from 'next/link';

// Mock data
const recentTransactions = [
  { name: 'Starbucks', category: 'Food', amount: -12.50, icon: Utensils },
  { name: 'Uber', category: 'Transport', amount: -24.10, icon: Car },
  { name: 'Amazon', category: 'Shopping', amount: -99.99, icon: ShoppingBag },
  { name: 'CVS Pharmacy', category: 'Health', amount: -30.00, icon: HeartPulse },
  { name: 'Monthly Salary', category: 'Income', amount: 2500.00, icon: Utensils, isIncome: true },
];

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>You made 26 transactions this month.</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/transactions">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentTransactions.map((tx, index) => (
          <div key={index} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
                <div className="w-full h-full flex items-center justify-center bg-secondary rounded-full">
                    <tx.icon className="h-4 w-4 text-muted-foreground" />
                </div>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">{tx.name}</p>
              <p className="text-sm text-muted-foreground">{tx.category}</p>
            </div>
            <div className={`font-medium ${tx.isIncome ? 'text-primary' : ''}`}>
              {tx.isIncome ? '+' : ''}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
