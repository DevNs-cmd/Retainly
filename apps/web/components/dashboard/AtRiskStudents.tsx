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
    <div
      className="p-6 rounded-2xl border shadow-xs font-sans flex flex-col justify-between h-full transition-colors"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-card)',
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              At-Risk Students
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Students needing proactive coach intervention
            </p>
          </div>
          <Link
            href="/students"
            className="text-xs font-bold text-amber-500 dark:text-amber-400 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Compact List */}
        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {students.slice(0, 5).map((student) => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 px-2 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-9 h-9 rounded-full object-cover border"
                  style={{ borderColor: 'var(--border-card)' }}
                />
                <div>
                  <h4 className="text-xs font-bold group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" style={{ color: 'var(--text-primary)' }}>
                    {student.name}
                  </h4>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {student.course}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Last active
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {student.lastActive}
                  </p>
                </div>

                <div
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1 ${
                    student.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                      : student.riskLevel === 'HIGH'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 border border-yellow-500/30'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{student.riskLevel} ({student.riskScore})</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
