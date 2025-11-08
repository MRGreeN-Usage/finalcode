import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  currentMonth: Date;
  onMonthChange: (direction: 'next' | 'prev') => void;
}

export function MonthSelector({ currentMonth, onMonthChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMonthChange('prev')}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous month</span>
      </Button>
      <span className="text-sm font-medium w-32 text-center">
        {format(currentMonth, 'MMMM yyyy')}
      </span>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onMonthChange('next')}>
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next month</span>
      </Button>
    </div>
  );
}
