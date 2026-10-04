'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Users, ShieldAlert, Filter, Loader2, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { AtRiskStudents } from '../../../components/dashboard/AtRiskStudents';
import { StudentsService } from '../../../services/students.service';
import { Student } from '../../../types/student';
import { apiFetch } from '../../../services/api-client';
import { useToast } from '../../../context/ToastContext';

export default function RiskAndChurnPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('ALL');

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StudentsService.getStudents();
      setStudents(data);
    } catch (err: any) {
      console.error('Failed to load students for risk analysis:', err);
      setError(err?.message || 'Failed to load risk analysis data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunRescan = async () => {
    if (students.length === 0) {
      toastError('No Students', 'Create students before running AI risk scans.');
      return;
    }

    try {
      setIsScanning(true);
      let scannedCount = 0;
      for (const s of students.slice(0, 5)) {
        try {
          await apiFetch(`risk/scores/recalculate/${s.id}`, { method: 'POST' });
          scannedCount++;
        } catch (e) {
          console.warn(`Rescan skipped for student ${s.id}:`, e);
        }
      }
      success(
        'AI Risk Rescan Dispatched',
        `Dispatched deep neural risk scoring jobs for ${scannedCount} student profiles. Results updating via worker.`
      );
      await loadData();
    } catch (err: any) {
      console.error('Rescan failed:', err);
      toastError('Scan Error', err?.message || 'Failed to trigger risk recalculation.');
    } finally {
      setIsScanning(false);
    }
  };

  const totalStudents = students.length;
  const atRiskCohort = students.filter((s) => (s.riskScore ?? 0) >= 50);
  const highChurn = students.filter((s) => (s.riskScore ?? 0) >= 70);
  const critical = students.filter((s) => s.riskLevel === 'CRITICAL' || (s.riskScore ?? 0) >= 85);

  const filteredStudents = students.filter((s) => {
    const score = s.riskScore ?? 0;
    if (selectedCohort === 'CRITICAL') return s.riskLevel === 'CRITICAL' || score >= 85;
    if (selectedCohort === 'HIGH') return score >= 70 && score < 85;
    if (selectedCohort === 'MEDIUM') return score >= 50 && score < 70;
    if (selectedCohort === 'LOW') return score < 50;
    return true;
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
            Identify learners requiring proactive coach outreach before they cancel or drop out.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border hover:opacity-80 transition-all flex items-center justify-center disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
            }}
            title="Refresh risk scores"
            aria-label="Refresh risk scores"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleRunRescan}
            disabled={isScanning || loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-75"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Queueing AI Rescan...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Run AI Risk Rescan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Analyzing student retention signals...
          </p>
        </div>
      )}

      {!loading && (
        <>
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
                {totalStudents}
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                Enrolled in workspace
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
                {atRiskCohort.length}
              </div>
              <span className="text-[11px] font-semibold text-amber-500 dark:text-amber-400">
                {totalStudents > 0 ? Math.round((atRiskCohort.length / totalStudents) * 100) : 0}% of cohort
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
                {highChurn.length}
              </div>
              <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400">
                Score &gt;= 70 (Urgent)
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
                {critical.length}
              </div>
              <span className="text-[11px] font-semibold text-red-500 dark:text-red-400">
                Needs immediate coach action
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
                <option value="ALL">All Risk Cohorts ({students.length})</option>
                <option value="CRITICAL">Critical Only (&gt;= 85)</option>
                <option value="HIGH">High Risk (70 - 85)</option>
                <option value="MEDIUM">Medium Risk (50 - 70)</option>
                <option value="LOW">Low Risk (&lt; 50)</option>
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
                    Failing assessments or stalling midway through lessons triggers automated coaching alerts.
                  </p>
                </div>

                <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                  <h4 className="text-xs font-bold text-sky-600 dark:text-sky-300">
                    3. Subscription Renewal with Auto-Renew Off
                  </h4>
                  <p className="text-[11px] mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                    Learners disabling auto-renewal without coach intervention drop off at high rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
