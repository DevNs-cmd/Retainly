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
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-500/15 border-rose-500/30',
    title: 'Sarah Johnson flagged as critical risk (Score 87)',
    time: '2 minutes ago',
  },
  {
    id: 'act-2',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/15 border-emerald-500/30',
    title: 'Rahul Sharma completed Module 4 Assessment',
    time: '18 minutes ago',
  },
  {
    id: 'act-3',
    icon: Send,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/15 border-amber-500/30',
    title: 'Retention sequence "Win Back #12" sent to 18 students',
    time: '32 minutes ago',
  },
  {
    id: 'act-4',
    icon: RotateCcw,
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-500/15 border-cyan-500/30',
    title: 'Emily Davis returned after 5 days inactivity',
    time: '1 hour ago',
  },
  {
    id: 'act-5',
    icon: UserPlus,
    iconColor: 'text-sky-500',
    bgColor: 'bg-sky-500/15 border-sky-500/30',
    title: 'Outreach task assigned to Alex Morgan',
    time: '2 hours ago',
  },
];

export function RecentActivity() {
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
          <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Recent Activity
          </h3>
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-subtle-text)',
              border: '1px solid var(--accent-subtle-border)',
            }}
          >
            Live Feed
          </span>
        </div>

        <div className="space-y-3">
          {ACTIVITIES.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${act.bgColor}`}>
                  <Icon className={`w-4 h-4 ${act.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium leading-snug truncate" style={{ color: 'var(--text-secondary)' }}>
                    {act.title}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {act.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
