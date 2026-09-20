'use client';

import React, { useState } from 'react';
import { CheckSquare, Clock, Plus, CheckCircle2, X, Check, Filter } from 'lucide-react';
import { MOCK_TASKS } from '../../../mock/tasks';
import { CoachTask } from '../../../types/task';
import { useToast } from '../../../context/ToastContext';

export default function TasksPage() {
  const [tasks, setTasks] = useState<(CoachTask & { completed?: boolean })[]>(
    MOCK_TASKS.map((t) => ({ ...t, completed: false }))
  );
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newStudent, setNewStudent] = useState('Sarah Johnson');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium'>('High');
  const [newDue, setNewDue] = useState('Today, 5:00 PM');
  const [newNotes, setNewNotes] = useState('');

  const { success } = useToast();

  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.completed;
          if (nextState) {
            success('Task completed', `"${t.title}" has been marked as resolved.`);
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: CoachTask & { completed?: boolean } = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      studentId: 'stu-new',
      studentName: newStudent,
      studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      course: 'AI Masterclass',
      priority: newPriority,
      status: 'Pending',
      dueTime: newDue,
      coachAssigned: 'Alex Morgan',
      notes: newNotes.trim() || undefined,
      completed: false,
    };

    setTasks([task, ...tasks]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewNotes('');
    success('Coach task created', `Intervention task assigned for ${newStudent}.`);
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

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Coach Task</span>
        </button>
      </div>

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

                <img
                  src={task.studentAvatar}
                  alt={task.studentName}
                  className="w-10 h-10 rounded-full object-cover border shrink-0"
                  style={{ borderColor: 'var(--border-card)' }}
                />

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
                    {task.studentName} · {task.course} · Coach: {task.coachAssigned}
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

              <div className="flex items-center gap-4 text-right shrink-0">
                <div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      task.priority === 'High'
                        ? 'bg-rose-500/15 text-rose-500 dark:text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <p className="text-xs mt-1.5 flex items-center justify-end gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    <span>{task.dueTime}</span>
                  </p>
                </div>
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
                  Student
                </label>
                <select
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="Sarah Johnson">Sarah Johnson (Score 87 - Critical)</option>
                  <option value="Michael Brown">Michael Brown (Score 82 - High)</option>
                  <option value="Emily Davis">Emily Davis (Score 76 - High)</option>
                  <option value="Carlos Mendez">Carlos Mendez (Score 68 - Med)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'High' | 'Medium')}
                    className="w-full p-2.5 rounded-xl border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-input)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Due Time
                  </label>
                  <input
                    type="text"
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                    className="w-full p-2.5 rounded-xl border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      borderColor: 'var(--border-input)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
