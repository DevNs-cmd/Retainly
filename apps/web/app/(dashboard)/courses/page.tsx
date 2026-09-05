'use client';

import React from 'react';
import { BookOpen, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

const MOCK_COURSES = [
  {
    id: 'c-101',
    title: 'AI Masterclass',
    instructor: 'Alex Morgan',
    studentsCount: 1420,
    completionRate: 68,
    retentionRate: 89.2,
    atRiskCount: 42,
    revenueAtRisk: '$8,400',
  },
  {
    id: 'c-102',
    title: 'Python Bootcamp',
    instructor: 'David Miller',
    studentsCount: 1150,
    completionRate: 54,
    retentionRate: 84.1,
    atRiskCount: 68,
    revenueAtRisk: '$6,800',
  },
  {
    id: 'c-103',
    title: 'Marketing Pro',
    instructor: 'Sarah Jenkins',
    studentsCount: 980,
    completionRate: 72,
    retentionRate: 91.5,
    atRiskCount: 24,
    revenueAtRisk: '$3,600',
  },
  {
    id: 'c-104',
    title: 'Leadership 101',
    instructor: 'Alex Morgan',
    studentsCount: 650,
    completionRate: 46,
    retentionRate: 81.0,
    atRiskCount: 52,
    revenueAtRisk: '$5,200',
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Courses Retention Breakdown</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Evaluate retention rates, completion progress, and churn risk across your course catalog.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_COURSES.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{course.title}</h3>
                  <p className="text-xs text-slate-400">Instructor: {course.instructor}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {course.retentionRate}% Retention
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-slate-100">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Students</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{course.studentsCount}</p>
              </div>
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                <span className="text-[10px] text-rose-700 uppercase font-bold">At Risk</span>
                <p className="text-sm font-bold text-rose-900 mt-0.5">{course.atRiskCount}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Revenue at Risk</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{course.revenueAtRisk}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
