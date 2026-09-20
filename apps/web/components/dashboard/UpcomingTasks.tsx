'use client';

import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import { CoachTask } from '../../types/task';

interface UpcomingTasksProps {
  tasks: CoachTask[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <div
      className="p-6 rounded-2xl border shadow-xs font-sans flex flex-col justify-between h-full transition-colors"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Upcoming Tasks
            </h3>
          </div>
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-subtle-text)',
              border: '1px solid var(--accent-subtle-border)',
            }}
          >
            {tasks.length} Pending
          </span>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 border rounded-xl hover:opacity-95 transition-all"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-card)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {task.title}
                </h4>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    task.priority === 'High'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-1.5">
                  <img
                    src={task.studentAvatar}
                    alt={task.studentName}
                    className="w-4 h-4 rounded-full object-cover border"
                    style={{ borderColor: 'var(--border-card)' }}
                  />
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {task.studentName}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  <span>{task.dueTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
