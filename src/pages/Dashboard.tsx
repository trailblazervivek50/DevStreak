import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { StreakCounter } from '../components/StreakCounter';
import { Heatmap } from '../components/Heatmap';
import { TaskCard } from '../components/TaskCard';
import { streak, tasks } from '../lib/api';
import { format } from 'date-fns';

export function Dashboard() {
  const [streakData, setStreakData] = useState({ current_streak: 0, longest_streak: 0, last_completed_date: null });
  const [todayTasks, setTodayTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streakRes, tasksRes] = await Promise.all([
          streak.get(),
          tasks.getAll()
        ]);
        setStreakData(streakRes);
        setTodayTasks(tasksRes.slice(0, 5)); // Just show a few tasks
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mock completions for heatmap until backend provides it
  const mockCompletions = Array.from({ length: streakData.current_streak }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString();
  });

  if (isLoading) {
    return <div className="animate-pulse flex flex-col gap-8">
      <div className="h-8 bg-secondary rounded w-1/4"></div>
      <div className="h-40 bg-secondary rounded-2xl"></div>
      <div className="h-64 bg-secondary rounded-2xl"></div>
    </div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'EEEE, MMMM do')}
        </p>
      </header>

      <StreakCounter 
        currentStreak={streakData.current_streak} 
        longestStreak={streakData.longest_streak} 
      />

      <Heatmap completions={mockCompletions} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Today's Tasks</h3>
        </div>
        
        {todayTasks.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <p className="text-muted-foreground">No tasks for today. Add some to keep your streak going!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {todayTasks.map((task: { id: number; title: string; is_daily: boolean; created_at: string }) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                isCompleted={false}
                onComplete={() => {}}
                onDelete={() => {}}
                onEdit={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
