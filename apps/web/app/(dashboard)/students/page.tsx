'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, Mail, ExternalLink } from 'lucide-react';
import { MOCK_STUDENTS } from '../../../mock/students';
import { Student, RiskLevel } from '../../../types/student';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');

  const filteredStudents = MOCK_STUDENTS.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRisk === 'ALL' || student.riskLevel === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Students Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor student completion rates, last activity, and AI risk scores.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
          <span>+ Enroll Student</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Risk Level:</span>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Students Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Completion</th>
                <th className="py-3.5 px-4">Risk Score</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <Link
                          href={`/students/${student.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {student.name}
                        </Link>
                        <p className="text-[11px] text-slate-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-700">{student.course}</td>
                  <td className="py-4 px-4">
                    <div className="w-32">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>{student.completionRate}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${student.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide inline-flex items-center gap-1 ${
                        student.riskLevel === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : student.riskLevel === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3" />
                      <span>{student.riskLevel} ({student.riskScore})</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">{student.lastActive}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/students/${student.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredStudents.length} of {MOCK_STUDENTS.length} students</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700">Page 1 of 1</span>
            <button className="p-1 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
