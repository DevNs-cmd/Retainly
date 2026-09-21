'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { RetentionTrendPoint } from '../../types/dashboard';

interface RetentionChartProps {
  data: RetentionTrendPoint[];
}

export function RetentionChart({ data }: RetentionChartProps) {
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month'>('Week');

  return (
    <div
      className="p-6 rounded-2xl border shadow-xs font-sans h-full flex flex-col justify-between transition-colors"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
      }}
    >
      {/* Chart Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Retention & Engagement
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Cohort activity & AI recovery performance
          </p>
        </div>

        {/* Period Selector Pills */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-card)',
          }}
        >
          {(['Day', 'Week', 'Month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                period === p
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: period === p ? '#0c141c' : 'var(--text-secondary)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Chart (Left) + Stats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center flex-1">
        {/* Recharts Canvas */}
        <div className="lg:col-span-3 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f5b82e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f5b82e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.15)" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[60, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--toast-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-card)',
                  color: 'var(--toast-text)',
                  fontSize: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                }}
                itemStyle={{ color: 'var(--toast-text)' }}
              />
              <Area type="monotone" dataKey="retentionRate" stroke="#f5b82e" strokeWidth={3} fillOpacity={1} fill="url(#retentionGrad)" name="Retention Rate (%)" />
              <Area type="monotone" dataKey="engagementRate" stroke="#38bdf8" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#engagementGrad)" name="Engagement Rate (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side Stats Column */}
        <div
          className="lg:col-span-1 border-t lg:border-t-0 lg:border-l lg:pl-6 pt-4 lg:pt-0 space-y-4"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Retention
            </span>
            <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              87.4%
            </p>
          </div>
          <div className="w-full h-px" style={{ backgroundColor: 'var(--border-subtle)' }}></div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Engagement
            </span>
            <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              74.8%
            </p>
          </div>
          <div className="w-full h-px" style={{ backgroundColor: 'var(--border-subtle)' }}></div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              At-Risk
            </span>
            <p className="text-xl font-bold mt-0.5 text-rose-500">
              342
            </p>
          </div>
          <div className="w-full h-px" style={{ backgroundColor: 'var(--border-subtle)' }}></div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400">
              Recovered
            </span>
            <p className="text-xl font-bold mt-0.5 text-amber-500 dark:text-amber-400">
              126
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
