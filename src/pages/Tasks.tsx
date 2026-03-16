import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TaskCard } from '../components/TaskCard';
import { tasks } from '../lib/api';
import { Plus } from 'lucide-react';

export function Tasks() {
  const [taskList, setTaskList] = useState<{ id: number; title: string; is_daily: boolean; created_at: string }[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await tasks.getAll();
      setTaskList(res);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await tasks.create({ title: newTaskTitle, is_daily: isDaily });
      setTaskList([newTask, ...taskList]);
      setNewTaskTitle('');
      setIsDaily(false);
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      await tasks.complete(id);
      // In a real app, we might want to mark it as completed in the UI
      // For now, we'll just show a success state or remove it from the active list
      alert("Task completed! Streak updated.");
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert("Task already completed today!");
      } else {
        console.error("Failed to complete task", error);
      }
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await tasks.delete(id);
      setTaskList(taskList.filter(t => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-1">Manage your daily goals and one-off tasks.</p>
      </header>

      <form onSubmit={handleAddTask} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-4 justify-between sm:justify-end">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input 
              type="checkbox" 
              checked={isDaily}
              onChange={(e) => setIsDaily(e.target.checked)}
              className="rounded border-border bg-secondary text-primary focus:ring-primary"
            />
            Daily Task
          </label>
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-secondary rounded-xl"></div>
          ))}
        </div>
      ) : taskList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks yet. Create one above!</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {taskList.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isCompleted={false}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
              onEdit={() => {}}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
