'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { CohortDataPoint } from '../../types/analytics';

interface CohortRetentionGraphProps {
  cohorts: CohortDataPoint[];
}

export function CohortRetentionGraph({ cohorts }: CohortRetentionGraphProps) {
  // Transform cohorts into points for Week 0, Week 2, Week 4, Week 6, Week 8
  const weeks = [
    { week: 'Week 0', key: 'week0' },
    { week: 'Week 2', key: 'week2' },
    { week: 'Week 4', key: 'week4' },
    { week: 'Week 6', key: 'week6' },
    { week: 'Week 8', key: 'week8' },
  ];

  const chartData = weeks.map(w => {
    const point: Record<string, any> = { week: w.week };
    cohorts.forEach(c => {
      point[c.cohort] = c[w.key as keyof CohortDataPoint];
    });
    return point;
  });

  const colors = ['#94a3b8', '#38bdf8', '#6366f1', '#8b5cf6', '#10b981'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs font-sans flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Cohort Retention Decay Curves</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              Survival Rate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Percentage of students retaining access from onboarding through Week 8
          </p>
        </div>

        {/* Cohort Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {cohorts.map((c, i) => (
            <div key={c.cohort} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
              <span className="text-slate-600 font-medium">{c.cohort}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              domain={[70, 100]}
              unit="%"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: any, name: any) => [`${value}% retained`, name]}
            />
            {cohorts.map((c, i) => (
              <Line
                key={c.cohort}
                type="monotone"
                dataKey={c.cohort}
                stroke={colors[i % colors.length]}
                strokeWidth={2.5}
                dot={{ r: 3, fill: colors[i % colors.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cohort Matrix Table Preview */}
      <div className="mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-400 font-medium border-b border-slate-100">
              <th className="pb-2">Cohort</th>
              <th className="pb-2 text-right">Students</th>
              <th className="pb-2 text-right">W0</th>
              <th className="pb-2 text-right">W2</th>
              <th className="pb-2 text-right">W4</th>
              <th className="pb-2 text-right">W6</th>
              <th className="pb-2 text-right">W8</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium">
            {cohorts.map((c) => (
              <tr key={c.cohort} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2 font-semibold text-slate-800">{c.cohort}</td>
                <td className="py-2 text-right text-slate-500">{c.initialSize}</td>
                <td className="py-2 text-right text-emerald-600 bg-emerald-50/30 font-semibold">{c.week0}%</td>
                <td className="py-2 text-right text-emerald-600 bg-emerald-50/20">{c.week2}%</td>
                <td className="py-2 text-right text-emerald-700 bg-emerald-50/10">{c.week4}%</td>
                <td className="py-2 text-right text-indigo-600 bg-indigo-50/20">{c.week6}%</td>
                <td className="py-2 text-right text-indigo-700 bg-indigo-50/30 font-bold">{c.week8}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
