'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Users, AlertTriangle, ShieldCheck, Loader2, AlertCircle, RefreshCw, Plus, X, Trash2 } from 'lucide-react';
import { CoursesService, CourseCardUI } from '../../../services/courses.service';
import { useToast } from '../../../context/ToastContext';

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseCardUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const { success, error: toastError } = useToast();

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CoursesService.getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error('Failed to load courses:', err);
      setError(err?.message || 'Failed to load courses catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      await CoursesService.createCourse(newName.trim(), newDesc.trim() || undefined);
      success('Course Created', `"${newName.trim()}" added to workspace.`);
      setIsModalOpen(false);
      setNewName('');
      setNewDesc('');
      await loadCourses();
    } catch (err: any) {
      console.error('Failed to create course:', err);
      toastError('Creation Failed', err?.message || 'Could not create course.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course "${title}"?`)) return;

    try {
      await CoursesService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      success('Course Deleted', `"${title}" has been deleted.`);
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      toastError('Delete Failed', err?.message || 'Could not delete course.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Courses Retention Breakdown
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Evaluate retention rates, completion progress, and churn risk across your course catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCourses}
            disabled={loading}
            className="p-2.5 rounded-xl border hover:opacity-80 transition-all flex items-center justify-center disabled:opacity-50"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
            }}
            title="Refresh courses"
            aria-label="Refresh courses"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
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
            onClick={loadCourses}
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
            Loading course retention breakdown...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && courses.length === 0 && (
        <div
          className="p-12 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center space-y-3"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            No Courses Found
          </h3>
          <p className="text-xs max-w-sm" style={{ color: 'var(--text-muted)' }}>
            Add courses to your workspace or sync with Kajabi/Teachable to track student completion.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-6 rounded-2xl border shadow-xs space-y-4 transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {course.title}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {course.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                    {course.retentionRate}% Retention
                  </span>
                  <button
                    onClick={() => handleDeleteCourse(course.id, course.title)}
                    className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:text-rose-500 transition-colors"
                    title="Delete course"
                    aria-label={`Delete ${course.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div
                className="grid grid-cols-3 gap-2 pt-2 text-center border-t"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>
                    Students
                  </span>
                  <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {course.studentsCount}
                  </p>
                </div>
                <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <span className="text-[10px] text-rose-500 uppercase font-bold">At Risk</span>
                  <p className="text-sm font-bold text-rose-500 mt-0.5">{course.atRiskCount}</p>
                </div>
                <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>
                    Revenue at Risk
                  </span>
                  <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                    {course.revenueAtRisk}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-labelledby="course-modal-title"
            aria-modal="true"
            className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="course-modal-title" className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Create New Course
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Course Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced AI Engineering"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short curriculum summary..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Creating...' : 'Create Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
