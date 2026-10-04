'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Send, RotateCcw, Activity, RefreshCw } from 'lucide-react';
import { ActivitiesService, BackendStudentActivity } from '../../services/activities.service';

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

function getActivityDisplay(act: BackendStudentActivity) {
  const type = (act.activityType || '').toUpperCase();
  if (type.includes('RISK') || type.includes('ALERT')) {
    return {
      icon: AlertCircle,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/15 border-rose-500/30',
    };
  }
  if (type.includes('COMPLETION') || type.includes('PASSED') || type.includes('SUBMIT')) {
    return {
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/15 border-emerald-500/30',
    };
  }
  if (type.includes('MESSAGE') || type.includes('CAMPAIGN') || type.includes('EMAIL') || type.includes('COMMUNICATION')) {
    return {
      icon: Send,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/15 border-amber-500/30',
    };
  }
  if (type.includes('RETURN') || type.includes('ACTIVE') || type.includes('REENGAGE')) {
    return {
      icon: RotateCcw,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-500/15 border-cyan-500/30',
    };
  }
  return {
    icon: Activity,
    iconColor: 'text-sky-500',
    bgColor: 'bg-sky-500/15 border-sky-500/30',
  };
}

function getActivityTitle(act: BackendStudentActivity): string {
  if (act.payload && typeof act.payload.title === 'string' && act.payload.title.trim()) {
    return act.payload.title;
  }
  if (act.payload && typeof act.payload.message === 'string' && act.payload.message.trim()) {
    return act.payload.message;
  }
  if (act.payload && typeof act.payload.description === 'string' && act.payload.description.trim()) {
    return act.payload.description;
  }
  const cleanType = (act.activityType || 'Activity').replace(/_/g, ' ').toLowerCase();
  return `${cleanType.charAt(0).toUpperCase() + cleanType.slice(1)} recorded via ${act.source || 'telemetry'}`;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<BackendStudentActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ActivitiesService.getActivities({ limit: 5 });
      setActivities(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl">
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-xs text-rose-500 mb-2">{error}</p>
            <button
              onClick={fetchActivities}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 px-2 border border-dashed rounded-xl" style={{ borderColor: 'var(--border-subtle)' }}>
            <Activity className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              No Recent Activity Recorded
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Student logins, completions, and risk alerts will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => {
              const display = getActivityDisplay(act);
              const Icon = display.icon;
              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${display.bgColor}`}>
                    <Icon className={`w-4 h-4 ${display.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug truncate" style={{ color: 'var(--text-secondary)' }}>
                      {getActivityTitle(act)}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {formatRelativeTime(act.occurredAt || act.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
