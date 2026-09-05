'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Send, RotateCcw, UserPlus } from 'lucide-react';

interface ActivityItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    icon: AlertCircle,
    iconColor: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-100',
    title: 'Sarah Johnson became high risk (Score 87)',
    time: '2 minutes ago',
  },
  {
    id: 'act-2',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-100',
    title: 'Rahul Sharma completed Module 4 Assessment',
    time: '18 minutes ago',
  },
  {
    id: 'act-3',
    icon: Send,
    iconColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-100',
    title: 'Retention campaign "Win Back #12" triggered',
    time: '32 minutes ago',
  },
  {
    id: 'act-4',
    icon: RotateCcw,
    iconColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50 border-cyan-100',
    title: 'Emily Davis returned after 5 days inactivity',
    time: '1 hour ago',
  },
  {
    id: 'act-5',
    icon: UserPlus,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-100',
    title: 'Coach task assigned to Alex Morgan',
    time: '2 hours ago',
  },
];

export function RecentActivity() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs font-sans flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Activity</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Feed</span>
        </div>

        <div className="space-y-3">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${act.bgColor}`}>
                  <Icon className={`w-4 h-4 ${act.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 leading-snug truncate">{act.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
