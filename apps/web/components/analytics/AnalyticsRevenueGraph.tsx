'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { RevenueDataPoint } from '../../types/analytics';
import { DollarSign, ShieldCheck } from 'lucide-react';

interface AnalyticsRevenueGraphProps {
  data: RevenueDataPoint[];
  range: string;
}

export function AnalyticsRevenueGraph({ data, range }: AnalyticsRevenueGraphProps) {
  const totalRecovered = data.reduce((acc, item) => acc + item.recoveredRevenue, 0);
  const totalAtRisk = data.reduce((acc, item) => acc + item.atRiskRevenue, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Revenue Impact & Saved ARR</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Recovered vs At-Risk
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dollar value of protected subscriptions through AI automated workflows
          </p>
        </div>

        {/* Totals Summary */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
            <span className="text-slate-500 font-medium">Recovered:</span>
            <span className="font-bold text-emerald-600">${totalRecovered.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block"></span>
            <span className="text-slate-500 font-medium">At Risk:</span>
            <span className="font-bold text-slate-700">${totalAtRisk.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
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
              tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as RevenueDataPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
                      <div className="font-semibold text-slate-200 border-b border-slate-700/60 pb-1">
                        {label}
                      </div>
                      <div className="flex items-center justify-between text-emerald-400">
                        <span>Recovered Revenue:</span>
                        <span className="font-bold">${item.recoveredRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>At Risk Revenue:</span>
                        <span className="font-medium">${item.atRiskRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-300 pt-1 border-t border-slate-800">
                        <span>Recovery Ratio:</span>
                        <span className="font-semibold">
                          {((item.recoveredRevenue / (item.recoveredRevenue + item.atRiskRevenue)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="recoveredRevenue"
              name="Recovered Revenue"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="atRiskRevenue"
              name="At-Risk Revenue"
              fill="#cbd5e1"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
