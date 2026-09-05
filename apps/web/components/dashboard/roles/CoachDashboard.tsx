'use client';

import React from 'react';
import Link from 'next/link';
import { CheckSquare, AlertTriangle, Mail, Phone, Calendar, UserCheck, ArrowRight } from 'lucide-react';
import { Student } from '../../../types/student';
import { CoachTask } from '../../../types/task';

interface CoachDashboardProps {
  atRiskStudents: Student[];
  tasks: CoachTask[];
}

export function CoachDashboard({ atRiskStudents, tasks }: CoachDashboardProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Role Notice Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs font-medium text-amber-950">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          <span><strong>COACH VIEW:</strong> Retention intervention workspace, assigned student caseload, and outreach tasks.</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-amber-600 text-white px-2 py-0.5 rounded-full">Coach Workspace</span>
      </div>

      {/* Coach Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">My Assigned At-Risk Students</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">14 Students</div>
          <span className="text-[11px] text-slate-400">High & Critical risk level</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Interventions Today</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">3 Tasks</div>
          <span className="text-[11px] text-amber-600 font-semibold">2 High priority</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">My Successful Recoveries</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">18 Students</div>
          <span className="text-[11px] text-emerald-600 font-semibold">+4 this week</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Avg Response Time</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">1.4 Hours</div>
          <span className="text-[11px] text-slate-400">Within 24h SLA</span>
        </div>
      </div>

      {/* Main Coach Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned High Risk Students Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Priority Student Caseload</h3>
              <p className="text-xs text-slate-400">Students assigned to Coach David Miller requiring outreach</p>
            </div>
            <Link href="/students" className="text-xs font-bold text-indigo-600 hover:underline">
              View All Students →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {atRiskStudents.map((student) => (
              <div key={student.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <div>
                    <Link href={`/students/${student.id}`} className="font-bold text-xs text-slate-900 hover:text-indigo-600">
                      {student.name}
                    </Link>
                    <p className="text-[11px] text-slate-400">{student.course} · Last active {student.lastActive}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    RISK {student.riskScore} ({student.riskLevel})
                  </span>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/students/${student.id}`}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                      title="Send Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coach Pending Outreach Tasks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Outreach Tasks Today</h3>
            <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full">
              {tasks.length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-md uppercase">
                    {task.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{task.studentName} · {task.course}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Due: {task.dueTime}</span>
                  <button className="text-indigo-600 font-bold hover:underline">Complete Task ✓</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
