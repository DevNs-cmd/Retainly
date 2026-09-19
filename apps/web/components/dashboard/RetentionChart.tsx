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
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs font-sans h-full flex flex-col justify-between">
      {/* Chart Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Retention & Engagement</h3>
          <p className="text-xs text-slate-400 mt-0.5">Cohort activity & AI recovery performance</p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          {(['Day', 'Week', 'Month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                period === p
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
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
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[60, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="retentionRate" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#retentionGrad)" name="Retention Rate (%)" />
              <Area type="monotone" dataKey="engagementRate" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#engagementGrad)" name="Engagement Rate (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right Side Stats Column (Matching reference image summary structure) */}
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0 space-y-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Retention</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">87.4%</p>
          </div>
          <div className="w-full h-px bg-slate-100"></div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Engagement</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">74.8%</p>
          </div>
          <div className="w-full h-px bg-slate-100"></div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">At-Risk</span>
            <p className="text-xl font-bold text-rose-600 mt-0.5">342</p>
          </div>
          <div className="w-full h-px bg-slate-100"></div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recovered</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">126</p>
          </div>
        </div>
      </div>
    </div>
  );
}
