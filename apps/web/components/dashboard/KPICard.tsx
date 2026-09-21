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
    <div
      className="p-5 rounded-2xl border shadow-xs hover:border-amber-400/40 transition-all duration-200 font-sans flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {data.title}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center border"
          style={{
            backgroundColor: 'var(--accent-subtle)',
            borderColor: 'var(--accent-subtle-border)',
            color: 'var(--accent-subtle-text)',
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
          {data.value}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium">
          <span className={data.isPositive ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}>
            {data.change}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>· {data.description}</span>
        </div>
      </div>
    </div>
  );
}
