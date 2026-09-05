'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Download } from 'lucide-react';

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7D' | '30D' | '90D' | '12M'>('30D');

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Churn Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep-dive metrics into cohort retention, revenue recovery, and campaign ROI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            {(['7D', '30D', '90D', '12M'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  range === r ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Retention Rate</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">87.4%</div>
          <span className="text-[11px] text-emerald-600 font-semibold">+3.2% vs prior period</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Churn Rate</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">4.2%</div>
          <span className="text-[11px] text-emerald-600 font-semibold">-1.1% vs prior period</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Recovered Revenue</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">$18,420</div>
          <span className="text-[11px] text-emerald-600 font-semibold">+12.6% vs prior period</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Campaign ROI</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">14.2x</div>
          <span className="text-[11px] text-slate-400 font-semibold">Based on software cost</span>
        </div>
      </div>
    </div>
  );
}
