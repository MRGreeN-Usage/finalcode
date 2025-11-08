'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { PieChartData } from '@/lib/types';

// Mock data
const pieData: PieChartData[] = [
  { name: 'Food', value: 400, fill: 'var(--color-food)' },
  { name: 'Shopping', value: 300, fill: 'var(--color-shopping)' },
  { name: 'Transport', value: 200, fill: 'var(--color-transport)' },
  { name: 'Entertainment', value: 278, fill: 'var(--color-entertainment)' },
  { name: 'Other', value: 189, fill: 'var(--color-other)' },
];

const chartConfig = {
    food: { label: 'Food', color: 'hsl(var(--chart-1))' },
    shopping: { label: 'Shopping', color: 'hsl(var(--chart-2))' },
    transport: { label: 'Transport', color: 'hsl(var(--chart-3))' },
    entertainment: { label: 'Entertainment', color: 'hsl(var(--chart-4))' },
    other: { label: 'Other', color: 'hsl(var(--chart-5))' },
} satisfies ChartConfig;


export function CategoryPieChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense by Category</CardTitle>
        <CardDescription>A breakdown of your spending by category for this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="w-full h-full">
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
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
