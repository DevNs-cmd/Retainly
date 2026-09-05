'use client';

import React from 'react';
import { KPICard } from '../KPICard';
import { RetentionChart } from '../RetentionChart';
import { RetentionHealth } from '../RetentionHealth';
import { AtRiskStudents } from '../AtRiskStudents';
import { RecentActivity } from '../RecentActivity';
import { UpcomingTasks } from '../UpcomingTasks';
import { KPICardData, RetentionTrendPoint, RetentionHealthScore } from '../../../types/dashboard';
import { Student } from '../../../types/student';
import { CoachTask } from '../../../types/task';

interface OwnerDashboardProps {
  kpiCards: KPICardData[];
  trendData: RetentionTrendPoint[];
  healthScore: RetentionHealthScore | null;
  atRiskStudents: Student[];
  tasks: CoachTask[];
}

export function OwnerDashboard({ kpiCards, trendData, healthScore, atRiskStudents, tasks }: OwnerDashboardProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Role Notice Banner */}
      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs font-medium text-indigo-950">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
          <span><strong>OWNER VIEW:</strong> Showing executive financial intelligence, MRR at risk, and total recovered revenue.</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full">Executive</span>
      </div>

      {/* 4 Primary Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <KPICard key={kpi.id} data={kpi} />
        ))}
      </div>

      {/* Middle Grid: Main Retention Chart + Health Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <RetentionChart data={trendData} />
        </div>
        <div>
          {healthScore && <RetentionHealth data={healthScore} />}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <AtRiskStudents students={atRiskStudents} />
        <RecentActivity />
        <UpcomingTasks tasks={tasks} />
      </div>
    </div>
  );
}
