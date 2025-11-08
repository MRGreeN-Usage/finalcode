import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUpRight, Utensils, Car, ShoppingBag, HeartPulse, Building, Gamepad2, MoreHorizontal, Briefcase } from 'lucide-react';
import Link from 'next/link';
import type { Transaction, TransactionCategory } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const categoryIcons: Record<TransactionCategory, React.ElementType> = {
    'Food': Utensils,
    'Transport': Car,
    'Shopping': ShoppingBag,
    'Housing': Building,
    'Health': HeartPulse,
    'Entertainment': Gamepad2,
    'Income': Briefcase,
    'Other': MoreHorizontal,
};

export function RecentTransactions({ transactions, isLoading }: { transactions: Transaction[], isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial movements.</CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/transactions">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6">
        {isLoading && Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="grid gap-1 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-12" />
            </div>
        ))}
        {!isLoading && transactions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No transactions this month.</p>
        )}
        {!isLoading && transactions.map((tx) => {
          const Icon = categoryIcons[tx.category] || MoreHorizontal;
          return (
            <div key={tx.id} className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                  <div className="w-full h-full flex items-center justify-center bg-secondary rounded-full">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
              </Avatar>
              <div className="grid gap-1 flex-1">
                <p className="text-sm font-medium leading-none">{tx.description}</p>
                <p className="text-sm text-muted-foreground">{tx.category}</p>
              </div>
              <div className={`font-medium ${tx.type === 'income' ? 'text-primary' : ''}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
