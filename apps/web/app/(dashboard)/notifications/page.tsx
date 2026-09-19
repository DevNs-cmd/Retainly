'use client';

import React from 'react';
import { Bell, AlertCircle, CheckCircle2, Send, Check } from 'lucide-react';

const NOTIFS = [
  { id: '1', title: 'Sarah Johnson flagged as HIGH RISK (Score 87)', time: '2 minutes ago', read: false },
  { id: '2', title: 'Retention campaign "Win Back - 30 Days" triggered', time: '32 minutes ago', read: false },
  { id: '3', title: 'Carlos Mendez disabled subscription auto-renew', time: '2 hours ago', read: true },
  { id: '4', title: 'Weekly Retention Health Score updated to 84/100', time: '1 day ago', read: true },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications & Activity Feed</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time alerts on risk spikes, campaign executions, and coach assignments.</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          <Check className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="space-y-3">
        {NOTIFS.map((n) => (
          <div key={n.id} className={`p-4 rounded-2xl border ${n.read ? 'bg-white border-slate-200/80' : 'bg-indigo-50/50 border-indigo-100'} flex items-start gap-4`}>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
