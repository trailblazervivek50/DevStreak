import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', completed: 4 },
  { name: 'Tue', completed: 6 },
  { name: 'Wed', completed: 3 },
  { name: 'Thu', completed: 7 },
  { name: 'Fri', completed: 5 },
  { name: 'Sat', completed: 2 },
  { name: 'Sun', completed: 4 },
];

export function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Your productivity at a glance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completion Rate</span>
          <div className="text-4xl font-bold mt-2">82%</div>
          <span className="text-sm text-primary mt-2 block">↑ 4% vs last week</span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Daily Tasks</span>
          <div className="text-4xl font-bold mt-2">4.4</div>
          <span className="text-sm text-muted-foreground mt-2 block">Tasks per day</span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Most Productive Day</span>
          <div className="text-4xl font-bold mt-2">Thu</div>
          <span className="text-sm text-muted-foreground mt-2 block">7 tasks average</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">Weekly Completions</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#27272a' }}
                contentStyle={{ backgroundColor: '#141414', border: '1px solid #27272a', borderRadius: '8px' }}
              />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
