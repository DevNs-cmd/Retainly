'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, Plus, X, UserPlus, RotateCcw } from 'lucide-react';
import { MOCK_STUDENTS } from '../../../mock/students';
import { Student, RiskLevel } from '../../../types/student';
import { useToast } from '../../../context/ToastContext';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCourse, setNewCourse] = useState('AI Masterclass');
  const [newRisk, setNewRisk] = useState<RiskLevel>('LOW');
  const [formError, setFormError] = useState('');

  const { success } = useToast();

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRisk === 'ALL' || student.riskLevel === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setFormError('Please enter the student full name and email address.');
      return;
    }
    if (!newEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const newStudent: Student = {
      id: `stu-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      course: newCourse,
      courseId: 'crs-1',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (students.length % 10)}?w=150&auto=format&fit=crop&q=80`,
      enrolledDate: new Date().toISOString().split('T')[0],
      completionRate: 0,
      riskScore: newRisk === 'CRITICAL' ? 92 : newRisk === 'HIGH' ? 78 : newRisk === 'MEDIUM' ? 58 : 18,
      riskLevel: newRisk,
      riskExplanation: 'Newly enrolled student undergoing initial learning baseline.',
      riskFactors: [],
      lastActive: 'Just now',
      lastActiveDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      coachAssigned: 'Alex Morgan',
      timeline: [],
    };

    setStudents([newStudent, ...students]);
    setIsEnrollModalOpen(false);
    setNewName('');
    setNewEmail('');
    setFormError('');
    success('Student enrolled successfully', `${newName} has been added to the academy directory.`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRisk('ALL');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Students Directory
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Monitor student completion progress, recent learning sessions, and AI churn indicators.
          </p>
        </div>

        <button
          onClick={() => setIsEnrollModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className="p-4 rounded-2xl border shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Risk Cohort:
          </span>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl font-medium border focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-input)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Students Directory Table */}
      <div
        className="rounded-2xl border shadow-xs overflow-hidden transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Completion</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border"
                          style={{ borderColor: 'var(--border-card)' }}
                        />
                        <div>
                          <Link
                            href={`/students/${student.id}`}
                            className="font-bold hover:underline transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {student.name}
                          </Link>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {student.course}
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                          <span>{student.completionRate}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${student.completionRate}%`,
                              backgroundColor: 'var(--accent-primary)',
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide inline-flex items-center gap-1 ${
                          student.riskLevel === 'CRITICAL'
                            ? 'bg-rose-500/15 text-rose-500 dark:text-rose-300 border border-rose-500/30'
                            : student.riskLevel === 'HIGH'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                            : student.riskLevel === 'MEDIUM'
                            ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 border border-yellow-500/30'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>{student.riskLevel} ({student.riskScore})</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium" style={{ color: 'var(--text-muted)' }}>
                      {student.lastActive}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/students/${student.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border hover:opacity-90 transition-all inline-block"
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          borderColor: 'var(--border-card)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="p-12 text-center space-y-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              No students match your criteria
            </h3>
            <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              We could not find any students matching &quot;{searchTerm || selectedRisk}&quot;. Try adjusting your search query or reset the risk cohort filters.
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)',
                }}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset search filters</span>
              </button>
            </div>
          </div>
        )}

        {/* Table Footer */}
        <div
          className="p-4 border-t flex items-center justify-between text-xs"
          style={{
            borderColor: 'var(--border-card)',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            Showing {filteredStudents.length} of {students.length} students
          </span>
          <div className="flex items-center gap-2">
            <button
              className="p-1 rounded-lg border opacity-50 cursor-not-allowed"
              disabled
              style={{ borderColor: 'var(--border-card)' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Page 1 of 1
            </span>
            <button
              className="p-1 rounded-lg border opacity-50 cursor-not-allowed"
              disabled
              style={{ borderColor: 'var(--border-card)' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enroll Student Dialog Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-labelledby="enroll-modal-title"
            aria-modal="true"
            className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 id="enroll-modal-title" className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  Enroll New Student
                </h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan@example.com"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (formError) setFormError('');
                  }}
                  className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Assigned Course
                </label>
                <select
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="AI Masterclass">AI Masterclass</option>
                  <option value="Python Bootcamp">Python Bootcamp</option>
                  <option value="Marketing Pro">Marketing Pro</option>
                  <option value="Data Engineering">Data Engineering</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Initial Risk Assessment
                </label>
                <select
                  value={newRisk}
                  onChange={(e) => setNewRisk(e.target.value as RiskLevel)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="LOW">Low Risk (Standard Onboarding)</option>
                  <option value="MEDIUM">Medium Risk (Needs Early Check-in)</option>
                  <option value="HIGH">High Risk (At-Risk Profile)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl border font-semibold hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl shadow-md shadow-amber-500/20 transition-all"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
