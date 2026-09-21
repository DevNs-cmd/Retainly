'use client';

import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, Users, ShieldAlert, Filter, Loader2, CheckCircle2 } from 'lucide-react';
import { AtRiskStudents } from '../../../components/dashboard/AtRiskStudents';
import { MOCK_STUDENTS } from '../../../mock/students';
import { useToast } from '../../../context/ToastContext';

export default function RiskAndChurnPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');

  const { success } = useToast();

  const handleRunRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      success('AI Risk Rescan Completed', 'Analyzed 4,820 learning signals across 4 cohorts. 14 risk scores were refreshed.');
    }, 1200);
  };

  const filteredStudents = MOCK_STUDENTS.filter((s) => {
    const matchesCohort =
      selectedCohort === 'ALL' ||
      (selectedCohort === 'CRITICAL' && s.riskLevel === 'CRITICAL') ||
      (selectedCohort === 'HIGH' && s.riskLevel === 'HIGH') ||
      (selectedCohort === 'MEDIUM' && s.riskLevel === 'MEDIUM');

    const matchesCourse = selectedCourse === 'ALL' || s.course === selectedCourse;
    return matchesCohort && matchesCourse;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Risk & Churn Intelligence
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Identify students needing immediate coach outreach before they cancel or drop out.
          </p>
        </div>

        <button
          onClick={handleRunRescan}
          disabled={isScanning}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-75"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Scanning student cohorts...</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>Run AI Risk Rescan</span>
            </>
          )}
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl border shadow-xs transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Total Active Students
          </span>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            4,820
          </div>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
            Active across all courses
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border shadow-xs transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            At Risk Cohort
          </span>
          <div className="text-2xl font-bold mt-1 text-amber-500 dark:text-amber-400">
            342
          </div>
          <span className="text-[11px] font-semibold text-amber-500 dark:text-amber-400">
            7.1% of total enrolled
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border shadow-xs transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            High Churn Probability
          </span>
          <div className="text-2xl font-bold mt-1 text-rose-500 dark:text-rose-400">
            126
          </div>
          <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400">
            Score &gt; 75 (Urgent)
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border shadow-xs transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Critical Interventions
          </span>
          <div className="text-2xl font-bold mt-1 text-red-500 dark:text-red-400">
            28
          </div>
          <span className="text-[11px] font-semibold text-red-500 dark:text-red-400">
            Needs immediate coach call
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="p-4 rounded-2xl border shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            Cohort Filters:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="px-3 py-1.5 rounded-xl font-medium border focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-input)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Risk Cohorts</option>
            <option value="CRITICAL">Critical Only (&gt; 85)</option>
            <option value="HIGH">High Risk (70 - 85)</option>
            <option value="MEDIUM">Medium Risk (50 - 70)</option>
          </select>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1.5 rounded-xl font-medium border focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-input)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Enrolled Courses</option>
            <option value="AI Masterclass">AI Masterclass</option>
            <option value="Python Bootcamp">Python Bootcamp</option>
            <option value="Marketing Pro">Marketing Pro</option>
          </select>
        </div>
      </div>

      {/* Main Content: At Risk Students Table + Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AtRiskStudents students={filteredStudents} />
        </div>

        <div
          className="p-6 rounded-2xl border shadow-xs space-y-4 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            Top Churn Risk Drivers
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <h4 className="text-xs font-bold text-rose-500 dark:text-rose-300">
                1. Prolonged Inactivity (&gt; 7 Days)
              </h4>
              <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                Students inactive for over a week show an 84% probability of course abandonment.
              </p>
            </div>

            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-300">
                2. Stalled Quiz / Module Completion
              </h4>
              <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                Failing Module 3 assessment twice causes a sharp spike in cancellation intent.
              </p>
            </div>

            <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
              <h4 className="text-xs font-bold text-sky-600 dark:text-sky-300">
                3. Subscription Renewal with Auto-Renew Off
              </h4>
              <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                Billing reminders sent without automated intervention produce only 12% renewal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
