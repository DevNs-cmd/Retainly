'use client';

import React from 'react';
import { UserCheck, Plus, Mail } from 'lucide-react';

const TEAM = [
  { name: 'Alex Morgan', role: 'Head of Retention', email: 'alex@retainly.io', status: 'Active' },
  { name: 'David Miller', role: 'Student Success Coach', email: 'david@retainly.io', status: 'Active' },
  { name: 'Sarah Jenkins', role: 'Course Instructor', email: 'sarah@retainly.io', status: 'Active' },
];

export default function TeamPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members & Permissions</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage coaches, admins, and instructors assigned to your academy.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {TEAM.map((m, i) => (
          <div key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                {m.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{m.name}</h3>
                <p className="text-[11px] text-slate-400">{m.email} · {m.role}</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
