'use client';

import React from 'react';
import { Users, ShieldCheck, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { KPICardData } from '../../types/dashboard';

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle
};

interface KPICardProps {
  data: KPICardData;
}

export function KPICard({ data }: KPICardProps) {
  const Icon = ICON_MAP[data.iconName] || Users;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 font-sans flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-wide">{data.title}</span>
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
          <Icon className="w-4 h-4 text-indigo-600" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{data.value}</div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium">
          <span className={data.isPositive ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
            {data.change}
          </span>
          <span className="text-slate-400">· {data.description}</span>
        </div>
      </div>
    </div>
  );
}
