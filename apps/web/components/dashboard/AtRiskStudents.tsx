'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Student } from '../../types/student';

interface AtRiskStudentsProps {
  students: Student[];
}

export function AtRiskStudents({ students }: AtRiskStudentsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs font-sans flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">At-Risk Students</h3>
            <p className="text-xs text-slate-400">Students needing proactive intervention</p>
          </div>
          <Link
            href="/students"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Compact Table / List */}
        <div className="divide-y divide-slate-100">
          {students.slice(0, 5).map((student) => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {student.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">{student.course}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-semibold text-slate-500">Last active</p>
                  <p className="text-[10px] text-slate-400">{student.lastActive}</p>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 ${
                    student.riskLevel === 'CRITICAL'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : student.riskLevel === 'HIGH'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{student.riskLevel} {student.riskScore}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
