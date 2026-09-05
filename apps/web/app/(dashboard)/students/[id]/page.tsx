'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Mail, CheckSquare, Tag, Activity, Clock, ShieldAlert } from 'lucide-react';
import { MOCK_STUDENTS } from '../../../../mock/students';

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = MOCK_STUDENTS.find((s) => s.id === params.id) || MOCK_STUDENTS[0];

  return (
    <div className="space-y-6 font-sans">
      {/* Back Link & Header */}
      <div>
        <Link
          href="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </Link>

        {/* Student Profile Card Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{student.email} · Enrolled {student.enrolledDate}</p>
              <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-slate-600">
                <span>Course: <strong className="text-slate-900">{student.course}</strong></span>
                <span>Coach: <strong className="text-indigo-600">{student.coachAssigned}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors">
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>
            <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
              <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Create Coach Task</span>
            </button>
            <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Apply Offer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: AI Risk Analysis (Left) + Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Risk Diagnosis & Factors */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Churn Risk Score Banner */}
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 rounded-2xl border border-rose-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-rose-950">AI Churn Risk Explanation</h3>
              </div>
              <div className="px-3 py-1 bg-rose-600 text-white rounded-full text-xs font-extrabold tracking-wide">
                RISK SCORE {student.riskScore} / 100 ({student.riskLevel})
              </div>
            </div>

            <p className="text-xs font-medium text-rose-900 leading-relaxed bg-white/70 p-4 rounded-xl border border-rose-100 mb-4">
              &quot;{student.riskExplanation}&quot;
            </p>

            {/* Risk Factors List */}
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">Key Risk Signals Identified</h4>
            <div className="space-y-2">
              {student.riskFactors.map((factor) => (
                <div key={factor.id} className="flex items-center gap-2 text-xs font-semibold text-rose-900 bg-white p-2.5 rounded-xl border border-rose-100">
                  <span className="text-rose-600">↓</span>
                  <span>{factor.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress & Modules Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Course Progress Breakdown</h3>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Overall Completion Rate</span>
                <span className="text-slate-900">{student.completionRate}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${student.completionRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Student Activity Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Student Activity Timeline</h3>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {student.timeline.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white"></div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
