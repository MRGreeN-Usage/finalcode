'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';
import type { PieChartData } from '@/lib/types';

// Mock data
const pieData: PieChartData[] = [
  { name: 'Food', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Shopping', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'Transport', value: 200, fill: 'hsl(var(--chart-3))' },
  { name: 'Entertainment', value: 278, fill: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 189, fill: 'hsl(var(--chart-5))' },
];

export function CategoryPieChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense by Category</CardTitle>
        <CardDescription>A breakdown of your spending by category for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={5}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
