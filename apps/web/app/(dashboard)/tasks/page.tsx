'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, CheckCircle2, X, Check, Loader2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { TasksService, FrontendCoachTask, mapBackendTaskToFrontend } from '../../../services/tasks.service';
import { StudentsService } from '../../../services/students.service';
import { Student } from '../../../types/student';
import { useToast } from '../../../context/ToastContext';

export default function TasksPage() {
  const [tasks, setTasks] = useState<FrontendCoachTask[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const { success, error: toastError } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedTasks, fetchedStudents] = await Promise.all([
        TasksService.getTasks(),
        StudentsService.getStudents(),
      ]);

      const studentMap: Record<string, { name: string; email?: string }> = {};
      fetchedStudents.forEach((s) => {
        studentMap[s.id] = { name: s.name, email: s.email };
      });

      const mapped = fetchedTasks.map((t) => mapBackendTaskToFrontend(t, studentMap));
      setTasks(mapped);
      setStudents(fetchedStudents);

      if (fetchedStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(fetchedStudents[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      setError(err?.message || 'Failed to load coach tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextCompleted = !task.completed;
    const nextStatus = nextCompleted ? 'DONE' : 'PENDING';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: nextCompleted, status: nextCompleted ? 'Completed' : 'Pending' } : t))
    );

    try {
      await TasksService.updateTaskStatus(taskId, nextStatus);
      if (nextCompleted) {
        success('Task completed', `"${task.title}" has been marked as resolved.`);
      } else {
        success('Task reopened', `"${task.title}" marked as pending.`);
      }
    } catch (err: any) {
      console.error('Failed to update task:', err);
      toastError('Update Failed', err?.message || 'Could not update task status.');
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, completed: task.completed, status: task.status } : t))
      );
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!confirm(`Are you sure you want to remove task "${title}"?`)) return;

    try {
      await TasksService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      success('Task Removed', `"${title}" has been deleted.`);
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      toastError('Delete Failed', err?.message || 'Could not delete task.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (!selectedStudentId) {
      toastError('Missing Student', 'Please select or create a student first.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await TasksService.createTask({
        title: newTitle.trim(),
        studentId: selectedStudentId,
        notes: newNotes.trim() || undefined,
      });

      const studentMap: Record<string, { name: string; email?: string }> = {};
      students.forEach((s) => {
        studentMap[s.id] = { name: s.name, email: s.email };
      });

      const frontendTask = mapBackendTaskToFrontend(created, studentMap);
      setTasks((prev) => [frontendTask, ...prev]);

      setIsModalOpen(false);
      setNewTitle('');
      setNewNotes('');
      const targetStudent = students.find((s) => s.id === selectedStudentId);
      success('Coach task created', `Intervention task assigned for ${targetStudent?.name || 'student'}.`);
    } catch (err: any) {
      console.error('Failed to create task:', err);
      toastError('Creation Failed', err?.message || 'Could not create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'pending') return !t.completed;
    if (activeTab === 'completed') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Coach Tasks & Interventions
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage high-priority outreach tasks assigned to coaches for at-risk students.
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
            title="Refresh tasks"
            aria-label="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Coach Task</span>
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
            Loading coach tasks and assignments...
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border-card)' }}>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: activeTab === 'all' ? '#0c141c' : 'var(--text-secondary)',
              }}
            >
              All Tasks ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: activeTab === 'pending' ? '#0c141c' : 'var(--text-secondary)',
              }}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                color: activeTab === 'completed' ? '#0c141c' : 'var(--text-secondary)',
              }}
            >
              Completed ({tasks.length - pendingCount})
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between gap-4 transition-all duration-200 ${
                    task.completed ? 'opacity-60' : 'opacity-100'
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-card)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-400 hover:border-amber-400'
                      }`}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <h3
                        className={`text-sm font-bold transition-all ${
                          task.completed ? 'line-through opacity-70' : ''
                        }`}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {task.title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {task.studentName} · Assigned to: {task.coachAssigned}
                      </p>
                      {task.notes && (
                        <p
                          className="text-xs mt-2 p-2 rounded-xl border"
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            borderColor: 'var(--border-card)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right shrink-0">
                    <div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          task.completed
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {task.status}
                      </span>
                      <p className="text-xs mt-1.5 flex items-center justify-end gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                        <span>{task.dueTime}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      className="p-1.5 rounded-lg opacity-50 hover:opacity-100 hover:text-rose-500 transition-colors"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="p-12 text-center rounded-2xl border space-y-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-card)',
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {activeTab === 'completed'
                    ? 'No completed tasks yet'
                    : 'All clear! No pending tasks'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {activeTab === 'completed'
                    ? 'Resolved tasks will show up here once marked done.'
                    : 'All assigned student interventions are currently up to date.'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* New Task Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-labelledby="task-modal-title"
            aria-modal="true"
            className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="task-modal-title" className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Create New Coach Task
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Task Action Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule 1-on-1 unblocking call"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                  Target Student
                </label>
                {students.length > 0 ? (
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-input)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status} · Risk: {s.riskScore}%)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-rose-500">
                    No students found. Please add a student before creating coach tasks.
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Intervention Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Context regarding module bottleneck or drop-off reason..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
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
                  disabled={isSubmitting || students.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
