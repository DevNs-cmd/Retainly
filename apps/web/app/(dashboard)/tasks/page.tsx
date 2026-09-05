'use client';

import React from 'react';
import { CheckSquare, Clock, Plus, CheckCircle2 } from 'lucide-react';
import { MOCK_TASKS } from '../../../mock/tasks';

export default function TasksPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Coach Tasks & Interventions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage high-priority outreach tasks assigned to coaches for at-risk students.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs">
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      <div className="space-y-3">
        {MOCK_TASKS.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500" />
              <img src={task.studentAvatar} alt={task.studentName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                <p className="text-xs text-slate-400">{task.studentName} · {task.course} · Coach: {task.coachAssigned}</p>
                {task.notes && <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg">{task.notes}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                  {task.priority} Priority
                </span>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{task.dueTime}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
