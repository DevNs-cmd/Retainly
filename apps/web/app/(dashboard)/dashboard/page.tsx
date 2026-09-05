'use client';

import React, { useEffect, useState } from 'react';
import { Filter, Calendar, Sparkles } from 'lucide-react';
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
        <div className="h-10 bg-slate-200/60 rounded-xl w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80"></div>
          <div className="bg-white rounded-2xl border border-slate-200/80"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Dashboard Top Header (Matching reference: Good morning, Alex 👋) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning, Alex</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Here&apos;s your AI student retention overview.
          </p>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs cursor-pointer hover:bg-slate-50 transition-all">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Last 30 days</span>
            <span className="text-slate-400">▼</span>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-all">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
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
