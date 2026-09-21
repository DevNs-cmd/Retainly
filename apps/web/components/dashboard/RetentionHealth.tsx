'use client';

import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { RetentionHealthScore } from '../../types/dashboard';

interface RetentionHealthProps {
  data: RetentionHealthScore;
}

export function RetentionHealth({ data }: RetentionHealthProps) {
  return (
    <div
      className="p-6 rounded-2xl border shadow-xs font-sans h-full flex flex-col justify-between transition-colors"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
      }}
    >
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Retention Health
        </h3>
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
      </div>

      {/* Main Score Display */}
      <div
        className="flex items-center gap-3.5 mb-6 p-4 rounded-2xl border"
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
          <Star className="w-6 h-6 fill-slate-950 text-slate-950" />
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {data.overallScore}/100
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-subtle-text)',
                border: '1px solid var(--accent-subtle-border)',
              }}
            >
              {data.statusText}
            </span>
          </div>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Academy overall health index
          </p>
        </div>
      </div>

      {/* Metric Breakdown Progress Meters */}
      <div className="space-y-3.5 mb-6">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span style={{ color: 'var(--text-secondary)' }}>Engagement</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.breakdown.engagement}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${data.breakdown.engagement}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span style={{ color: 'var(--text-secondary)' }}>Completion Rate</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.breakdown.completion}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${data.breakdown.completion}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span style={{ color: 'var(--text-secondary)' }}>Activity Level</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.breakdown.activity}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${data.breakdown.activity}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span style={{ color: 'var(--text-secondary)' }}>Retention Metric</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{data.breakdown.retention}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.breakdown.retention}%` }}></div>
          </div>
        </div>
      </div>

      {/* Risk Distribution Breakdown */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>
          Risk Cohort Distribution
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Low</p>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{data.distribution.lowRisk}%</p>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Med</p>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mt-0.5">{data.distribution.mediumRisk}%</p>
          </div>
          <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">High</p>
            <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-0.5">{data.distribution.highRisk}%</p>
          </div>
          <div className="p-2 bg-red-500/15 rounded-xl border border-red-500/30">
            <p className="text-[10px] font-semibold text-red-600 dark:text-red-400">Critical</p>
            <p className="text-xs font-bold text-red-700 dark:text-red-300 mt-0.5">{data.distribution.critical}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
