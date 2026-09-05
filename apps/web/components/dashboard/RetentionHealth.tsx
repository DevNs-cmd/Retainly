'use client';

import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { RetentionHealthScore } from '../../types/dashboard';

interface RetentionHealthProps {
  data: RetentionHealthScore;
}

export function RetentionHealth({ data }: RetentionHealthProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs font-sans h-full flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Retention Health</h3>
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
      </div>

      {/* Main Score Display (Matching reference image ⭐ 82/100 Good) */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
          <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
        </div>
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900">{data.overallScore}/100</span>
            <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              {data.statusText}
            </span>
          </div>
          <p className="text-[11px] font-medium text-slate-400">Academy overall health index</p>
        </div>
      </div>

      {/* Metric Breakdown Progress Meters */}
      <div className="space-y-3.5 mb-6">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Engagement</span>
            <span className="text-slate-900">{data.breakdown.engagement}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${data.breakdown.engagement}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Completion Rate</span>
            <span className="text-slate-900">{data.breakdown.completion}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${data.breakdown.completion}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Activity Level</span>
            <span className="text-slate-900">{data.breakdown.activity}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data.breakdown.activity}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-slate-600">Retention Metric</span>
            <span className="text-slate-900">{data.breakdown.retention}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.breakdown.retention}%` }}></div>
          </div>
        </div>
      </div>

      {/* Risk Distribution Breakdown */}
      <div className="pt-4 border-t border-slate-100">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Risk Cohort Distribution
        </span>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-semibold text-emerald-700">Low</p>
            <p className="text-xs font-bold text-emerald-900 mt-0.5">{data.distribution.lowRisk}%</p>
          </div>
          <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100">
            <p className="text-[10px] font-semibold text-amber-700">Med</p>
            <p className="text-xs font-bold text-amber-900 mt-0.5">{data.distribution.mediumRisk}%</p>
          </div>
          <div className="p-2 bg-rose-50/60 rounded-xl border border-rose-100">
            <p className="text-[10px] font-semibold text-rose-700">High</p>
            <p className="text-xs font-bold text-rose-900 mt-0.5">{data.distribution.highRisk}%</p>
          </div>
          <div className="p-2 bg-red-100/60 rounded-xl border border-red-200">
            <p className="text-[10px] font-semibold text-red-800">Critical</p>
            <p className="text-xs font-bold text-red-950 mt-0.5">{data.distribution.critical}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
