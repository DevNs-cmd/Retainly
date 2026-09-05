'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, Users, ShieldAlert, Filter } from 'lucide-react';
import { AtRiskStudents } from '../../../components/dashboard/AtRiskStudents';
import { MOCK_STUDENTS } from '../../../mock/students';

export default function RiskAndChurnPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Risk & Churn Intelligence</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify students who need intervention before they cancel or drop out.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Run AI Risk Rescan</span>
        </button>
      </div>

      {/* Top Cards (Section 16) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Students</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">4,820</div>
          <span className="text-[11px] text-slate-400 font-medium">Active in workspace</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">At Risk</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">342</div>
          <span className="text-[11px] text-amber-600 font-semibold">7.1% of total cohort</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">High Risk</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">126</div>
          <span className="text-[11px] text-rose-600 font-semibold">Score &gt; 75</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Critical</span>
          <div className="text-2xl font-bold text-red-700 mt-1">28</div>
          <span className="text-[11px] text-red-700 font-semibold">Urgent action needed</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Risk Cohorts:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700">
            <option>All Risk Levels</option>
            <option>Critical (&gt; 90)</option>
            <option>High Risk (75-90)</option>
            <option>Medium Risk (50-75)</option>
          </select>

          <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700">
            <option>All Courses</option>
            <option>AI Masterclass</option>
            <option>Python Bootcamp</option>
            <option>Marketing Pro</option>
          </select>
        </div>
      </div>

      {/* Main Content: At Risk Students Table + Risk Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AtRiskStudents students={MOCK_STUDENTS} />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Top Churn Risk Factors</h3>

          <div className="space-y-3">
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <h4 className="text-xs font-bold text-rose-900">1. Inactivity &gt; 7 Days</h4>
              <p className="text-[11px] text-rose-700 mt-0.5">Accounts inactive for 7 days have an 84% higher churn probability.</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <h4 className="text-xs font-bold text-amber-900">2. Stalled Module Completion</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">Students stuck on Module 3 for over 10 days.</p>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-900">3. Expiring Subscriptions</h4>
              <p className="text-[11px] text-indigo-700 mt-0.5">Renewals approaching with auto-renew toggled off.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
