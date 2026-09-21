'use client';

import React, { useEffect, useState } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { KPICard } from '../../../components/dashboard/KPICard';
import { RetentionChart } from '../../../components/dashboard/RetentionChart';
import { RetentionHealth } from '../../../components/dashboard/RetentionHealth';
import { AtRiskStudents } from '../../../components/dashboard/AtRiskStudents';
import { RecentActivity } from '../../../components/dashboard/RecentActivity';
import { UpcomingTasks } from '../../../components/dashboard/UpcomingTasks';
import { RiskService } from '../../../services/risk.service';
import { StudentsService } from '../../../services/students.service';
import { KPICardData, RetentionTrendPoint, RetentionHealthScore } from '../../../types/dashboard';
import { Student } from '../../../types/student';
import { MOCK_TASKS } from '../../../mock/tasks';

export default function DashboardPage() {
  const [kpiCards, setKpiCards] = useState<KPICardData[]>([]);
  const [trendData, setTrendData] = useState<RetentionTrendPoint[]>([]);
  const [healthScore, setHealthScore] = useState<RetentionHealthScore | null>(null);
  const [atRiskStudents, setAtRiskStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [kpis, trend, health, students] = await Promise.all([
          RiskService.getKPICards(),
          RiskService.getRetentionTrend(),
          RiskService.getHealthScore(),
          StudentsService.getAtRiskStudents(),
        ]);
        setKpiCards(kpis);
        setTrendData(trend);
        setHealthScore(health);
        setAtRiskStudents(students);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 rounded-xl w-64" style={{ backgroundColor: 'var(--bg-card)' }}></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
          <div className="lg:col-span-2 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}></div>
          <div className="rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-card)' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>Good morning,</span>
            <span className="relative inline-block text-amber-500 dark:text-amber-400">
              Alex
              <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-amber-500 dark:text-amber-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                <path d="M0 15 Q 50 0, 100 12" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            Here is your AI student retention intelligence overview.
          </p>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-2 px-3.5 py-2 border rounded-xl text-xs font-semibold shadow-xs cursor-pointer hover:opacity-90 transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
            }}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Last 30 days</span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>▼</span>
          </div>

          <button
            className="flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold shadow-xs hover:opacity-90 transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
            }}
          >
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Middle Grid: Main Retention Chart (2/3 width) + Health Card (1/3 width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <RetentionChart data={trendData} />
        </div>
        <div>
          {healthScore && <RetentionHealth data={healthScore} />}
        </div>
      </div>

      {/* Bottom Grid: At-Risk Students (1/3) + Recent Activity (1/3) + Upcoming Tasks (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <AtRiskStudents students={atRiskStudents} />
        <RecentActivity />
        <UpcomingTasks tasks={MOCK_TASKS} />
      </div>
    </div>
  );
}
