import React from 'react';
import { Check, Edit2, Trash2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface TaskCardProps {
  key?: React.Key;
  task: {
    id: number;
    title: string;
    is_daily: boolean;
    created_at: string;
  };
  isCompleted: boolean;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export function TaskCard({ task, isCompleted, onComplete, onDelete, onEdit }: TaskCardProps) {
  return (
    <div className={cn(
      "group flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
      isCompleted 
        ? "bg-secondary/30 border-border/50 opacity-75" 
        : "bg-card border-border hover:border-primary/50"
    )}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onComplete(task.id)}
          disabled={isCompleted}
          className={cn(
            "w-6 h-6 rounded flex items-center justify-center border transition-colors",
            isCompleted 
              ? "bg-primary border-primary text-primary-foreground" 
              : "border-muted-foreground hover:border-primary"
          )}
        >
          {isCompleted && <Check className="w-4 h-4" />}
        </button>
        
        <div className="flex flex-col">
          <span className={cn(
            "text-sm font-medium transition-all",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </span>
          <div className="flex items-center gap-2 mt-1">
            {task.is_daily && (
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                Daily
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(task.created_at), 'MMM d')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(task.id)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(task.id)}
          className="p-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
