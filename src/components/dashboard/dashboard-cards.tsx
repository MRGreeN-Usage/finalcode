import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Landmark, PiggyBank } from 'lucide-react';

export function DashboardCards({ month }: { month: string }) {
  // Mock data - replace with real data from your backend
  const income = 5329.0;
  const expenses = 2500.72;
  const balance = income - expenses;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground">for {month}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">${expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground">for {month}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance > 0 ? 'text-primary' : 'text-destructive'}`}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">Remaining for {month}</p>
        </CardContent>
      </Card>
    </div>
  );
}
