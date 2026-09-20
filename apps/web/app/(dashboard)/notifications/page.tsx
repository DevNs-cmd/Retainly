'use client';

import React, { useState } from 'react';
import { Bell, AlertCircle, CheckCircle2, Check, Sparkles } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
  category: 'risk' | 'campaign' | 'billing' | 'system';
}

const INITIAL_NOTIFS: NotificationItem[] = [
  { id: '1', title: 'Sarah Johnson flagged as HIGH CHURN RISK (Score 87)', time: '2 minutes ago', read: false, category: 'risk' },
  { id: '2', title: 'Retention campaign "Win Back - 30 Days" triggered automatically for 18 students', time: '32 minutes ago', read: false, category: 'campaign' },
  { id: '3', title: 'Carlos Mendez disabled subscription auto-renew', time: '2 hours ago', read: true, category: 'billing' },
  { id: '4', title: 'Weekly Retention Health Score updated to 84/100 (+3.2% vs last week)', time: '1 day ago', read: true, category: 'system' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { success } = useToast();

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    success('Notifications updated', 'All alerts have been marked as read.');
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Notifications & Alerts
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Real-time feed for student risk spikes, automated campaign triggers, and coach updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border hover:opacity-90 transition-all self-start sm:self-auto"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)',
            }}
          >
            <Check className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-card)' }}>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            color: filter === 'all' ? '#0c141c' : 'var(--text-secondary)',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'opacity-70 hover:opacity-100'
          }`}
          style={{
            color: filter === 'unread' ? '#0c141c' : 'var(--text-secondary)',
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleToggleRead(n.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleToggleRead(n.id)}
              className={`p-4 rounded-2xl border shadow-xs flex items-start gap-4 cursor-pointer transition-all duration-150 ${
                n.read ? 'opacity-70' : 'ring-1 ring-amber-400/40'
              }`}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  n.read
                    ? 'bg-black/5 dark:bg-white/5 text-slate-400'
                    : 'bg-amber-400/20 text-amber-500 dark:text-amber-400'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {n.title}
                  </h3>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {n.time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div
            className="p-12 text-center rounded-2xl border space-y-2"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              You&apos;re completely caught up!
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No unread notifications at the moment. New alerts will show up here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
