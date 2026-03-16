import React from 'react';
import { Flame, Trophy } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Current Streak</span>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tighter">{currentStreak}</span>
          <Flame className="w-8 h-8 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground mt-2">days in a row</span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Longest Streak</span>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold tracking-tighter">{longestStreak}</span>
          <Trophy className="w-8 h-8 text-blue-500" />
        </div>
        <span className="text-sm text-muted-foreground mt-2">personal best</span>
      </div>
    </div>
  );
}
