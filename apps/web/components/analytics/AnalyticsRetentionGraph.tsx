'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { RetentionDataPoint } from '../../types/analytics';
import { TrendingUp, TrendingDown, Users, ShieldCheck } from 'lucide-react';

interface AnalyticsRetentionGraphProps {
  data: RetentionDataPoint[];
  range: string;
}

export function AnalyticsRetentionGraph({ data, range }: AnalyticsRetentionGraphProps) {
  const [metricView, setMetricView] = useState<'all' | 'retention' | 'churn'>('all');

  const latestPoint = data[data.length - 1] || { retentionRate: 0, churnRate: 0, activeStudents: 0, atRiskStudents: 0 };
  const firstPoint = data[0] || { retentionRate: 0, churnRate: 0 };
  const retentionDelta = (latestPoint.retentionRate - firstPoint.retentionRate).toFixed(1);
  const isRetentionPositive = parseFloat(retentionDelta) >= 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs font-sans flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Retention vs Churn Velocity</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {range} View
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cohort retention trends compared against student churn rates over time
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setMetricView('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              metricView === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Both
          </button>
          <button
            onClick={() => setMetricView('retention')}
            className={`px-3 py-1 rounded-lg transition-all ${
              metricView === 'retention'
                ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Retention
          </button>
          <button
            onClick={() => setMetricView('churn')}
            className={`px-3 py-1 rounded-lg transition-all ${
              metricView === 'churn'
                ? 'bg-white text-rose-600 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Churn
          </button>
        </div>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Current Retention</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 inline-block">
            {latestPoint.retentionRate}%
          </span>
          <span className={`ml-1.5 text-[11px] font-semibold ${isRetentionPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isRetentionPositive ? `+${retentionDelta}%` : `${retentionDelta}%`}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Current Churn Rate</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 inline-block">
            {latestPoint.churnRate}%
          </span>
          <span className="ml-1.5 text-[11px] font-semibold text-emerald-600">
            -{(firstPoint.churnRate - latestPoint.churnRate).toFixed(1)}%
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Cohort</span>
          <span className="text-lg font-bold text-slate-900 mt-0.5 inline-block">
            {latestPoint.activeStudents.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 ml-1">students</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">At-Risk Count</span>
          <span className="text-lg font-bold text-rose-600 mt-0.5 inline-block">
            {latestPoint.atRiskStudents}
          </span>
          <span className="text-[11px] text-slate-400 ml-1">flagged</span>
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="retentionAnalyticsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="churnAnalyticsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={metricView === 'churn' ? [0, 12] : [0, 100]}
              unit="%"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RetentionDataPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
                      <div className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1 flex justify-between">
                        <span>{label}</span>
                        <span className="text-slate-400 font-normal">{item.date}</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-400">
                        <span>Retention Rate:</span>
                        <span className="font-bold">{item.retentionRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-400">
                        <span>Churn Rate:</span>
                        <span className="font-bold">{item.churnRate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                        <span>Active Students:</span>
                        <span className="font-medium">{item.activeStudents}</span>
                      </div>
                      <div className="flex items-center justify-between text-amber-400">
                        <span>At Risk:</span>
                        <span className="font-medium">{item.atRiskStudents}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {(metricView === 'all' || metricView === 'retention') && (
              <Area
                type="monotone"
                dataKey="retentionRate"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#retentionAnalyticsGrad)"
                name="Retention Rate (%)"
              />
            )}
            {(metricView === 'all' || metricView === 'churn') && (
              <Area
                type="monotone"
                dataKey="churnRate"
                stroke="#e11d48"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#churnAnalyticsGrad)"
                name="Churn Rate (%)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
