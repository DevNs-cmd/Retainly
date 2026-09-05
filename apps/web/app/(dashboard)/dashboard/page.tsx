'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Filter, UserCheck } from 'lucide-react';
import { OwnerDashboard } from '../../../components/dashboard/roles/OwnerDashboard';
import { AdminDashboard } from '../../../components/dashboard/roles/AdminDashboard';
import { CoachDashboard } from '../../../components/dashboard/roles/CoachDashboard';
import { StudentDashboard } from '../../../components/dashboard/roles/StudentDashboard';
import { RiskService } from '../../../services/risk.service';
import { StudentsService } from '../../../services/students.service';
import { KPICardData, RetentionTrendPoint, RetentionHealthScore } from '../../../types/dashboard';
import { Student } from '../../../types/student';
import { MOCK_TASKS } from '../../../mock/tasks';
import { UserRole, MOCK_USER_PROFILES } from '../../../types/auth';

export default function DashboardPage() {
  const [activeRole, setActiveRole] = useState<UserRole>('OWNER');
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

  const currentProfile = MOCK_USER_PROFILES[activeRole];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse font-sans">
        <div className="h-10 bg-slate-200/60 rounded-xl w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Role Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good morning, {currentProfile.name.split(' ')[0]}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Logged in as <strong className="text-indigo-600">{currentProfile.title}</strong> · {currentProfile.academyName}
          </p>
        </div>

        {/* Interactive Role Switcher Pills */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Switch Role:</span>
          </span>
          {(['OWNER', 'ADMIN', 'COACH', 'STUDENT'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                activeRole === r
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Conditionally Render Persona Dashboard */}
      {activeRole === 'OWNER' && (
        <OwnerDashboard
          kpiCards={kpiCards}
          trendData={trendData}
          healthScore={healthScore}
          atRiskStudents={atRiskStudents}
          tasks={MOCK_TASKS}
        />
      )}

      {activeRole === 'ADMIN' && <AdminDashboard />}

      {activeRole === 'COACH' && (
        <CoachDashboard atRiskStudents={atRiskStudents} tasks={MOCK_TASKS} />
      )}

      {activeRole === 'STUDENT' && <StudentDashboard />}
    </div>
  );
}
