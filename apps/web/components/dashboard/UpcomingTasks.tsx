'use client';

import React from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import { CoachTask } from '../../types/task';

interface UpcomingTasksProps {
  tasks: CoachTask[];
}

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs font-sans flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Upcoming Tasks</h3>
          </div>
          <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 rounded-full bg-indigo-50">
            {tasks.length} Pending
          </span>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl hover:border-slate-200 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{task.title}</h4>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    task.priority === 'High'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <img
                    src={task.studentAvatar}
                    alt={task.studentName}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="font-medium text-slate-700">{task.studentName}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
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
