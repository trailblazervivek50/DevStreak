import React from 'react';
import { subDays, format, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';

interface HeatmapProps {
  completions: string[]; // Array of ISO date strings
}

export function Heatmap({ completions }: HeatmapProps) {
  // Generate last 90 days
  const days = Array.from({ length: 90 }).map((_, i) => {
    const date = subDays(new Date(), 89 - i);
    const isCompleted = completions.some(c => isSameDay(new Date(c), date));
    return {
      date,
      isCompleted
    };
  });

  // Group by weeks (columns)
  const weeks = [];
  let currentWeek = [];
  
  days.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Contribution Activity</h3>
      
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day, j) => (
              <div
                key={j}
                title={format(day.date, 'MMM d, yyyy')}
                className={cn(
                  "w-3 h-3 rounded-sm transition-colors",
                  day.isCompleted 
                    ? "bg-primary hover:bg-primary/80" 
                    : "bg-secondary hover:bg-secondary/80"
                )}
              />
            ))}
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
