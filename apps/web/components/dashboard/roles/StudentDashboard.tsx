'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, PlayCircle, Flame, CheckCircle2, Award, MessageSquare, Clock, ArrowRight } from 'lucide-react';

export function StudentDashboard() {
  return (
    <div className="space-y-6 font-sans">
      {/* Role Notice Banner */}
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-medium text-emerald-950">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span><strong>STUDENT VIEW:</strong> Personalized learning portal, course progress, next lessons, and coach feedback.</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">Student Portal</span>
      </div>

      {/* Student Welcome & Learning Streak Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-3">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>12-Day Learning Streak 🔥</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Keep up the great momentum, Sarah!</h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-lg">
            You are 34% through <strong>AI Masterclass</strong>. Complete your next lesson to unlock Module 4!
          </p>
        </div>

        <button className="px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition-all shrink-0">
          <PlayCircle className="w-5 h-5" />
          <span>Resume Next Lesson (12 mins)</span>
        </button>
      </div>

      {/* Enrolled Courses & Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Enrolled Courses */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">My Enrolled Courses</h3>
            <span className="text-xs font-bold text-slate-400">2 Active Courses</span>
          </div>

          <div className="space-y-4">
            {/* Course 1 */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">AI Masterclass</h4>
                    <p className="text-xs text-slate-400">Coach: Alex Morgan · Next: Module 3.2 Custom GPT Workflows</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">34% Completed</span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '34%' }}></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">Next Milestone: Module 3 Capstone</span>
                <button className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Course 2 */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Python Bootcamp</h4>
                    <p className="text-xs text-slate-400">Coach: David Miller · Next: Data Structures Lab</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-600">48% Completed</span>
              </div>

              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-600 rounded-full" style={{ width: '48%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Coach Feedback & Deadlines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900">Coach Feedback & Notes</h3>

          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-950">Message from Coach Alex</span>
            </div>
            <p className="text-xs text-indigo-900 italic leading-relaxed">
              &quot;Hi Sarah! Great work on Prompt Engineering Lab 1. Take a look at Module 3.2 before Friday&apos;s live Q&A session!&quot;
            </p>
            <span className="text-[10px] text-indigo-400 block pt-1">Sent yesterday at 4:30 PM</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Upcoming Deadlines</h4>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Module 3 Lab Submission</span>
              <span className="text-rose-600 font-bold">Due in 2 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
