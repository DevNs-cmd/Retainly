'use client';

import React from 'react';
import { Zap, Play, ArrowDown, Mail, Clock, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

export default function AutomationBuilderPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visual Automation Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated retention flows, triggers, and AI coach interventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
            Test Workflow
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs">
            Save Workflow
          </button>
        </div>
      </div>

      {/* Visual Workflow Canvas Area */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>

        <div className="relative z-10 w-full max-w-xl space-y-4">
          {/* Node 1: TRIGGER */}
          <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-700 uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>WHEN (TRIGGER)</span>
            </div>
            <p className="text-sm font-bold text-slate-900">Student Risk Score &gt; 80</p>
            <p className="text-xs text-slate-500 mt-0.5">AND Last activity &gt; 5 days inactive</p>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Node 2: ACTION */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs font-extrabold text-purple-700 uppercase tracking-wider mb-1">
              <Mail className="w-4 h-4 text-purple-600" />
              <span>THEN (ACTION)</span>
            </div>
            <p className="text-sm font-bold text-slate-900">Send Win-Back Email #1</p>
            <p className="text-xs text-slate-500 mt-0.5">Template: &quot;Need help with Module 3?&quot;</p>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Node 3: DELAY */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>WAIT 2 DAYS</span>
            </div>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Node 4: CONDITION BRANCH */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-xs">
            <div className="text-xs font-extrabold text-amber-700 uppercase tracking-wider mb-1">
              IF (CONDITION)
            </div>
            <p className="text-sm font-bold text-slate-900">Student logs in or views lesson?</p>
          </div>

          {/* Branch Splits */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">IF YES</span>
              <p className="text-xs font-bold text-emerald-900">Mark Intervention Successful</p>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-rose-700 uppercase block mb-1">IF NO</span>
              <p className="text-xs font-bold text-rose-900">Create Coach Task for Alex</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
