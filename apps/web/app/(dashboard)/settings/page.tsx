'use client';

import React from 'react';
import { Settings, Sliders, Bell, Key, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Configure organization preferences, AI churn risk thresholds, and API keys.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-2xl space-y-6">
        <h3 className="text-base font-bold text-slate-900">AI Risk Sensitivity & Thresholds</h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Critical Churn Risk Trigger (0 - 100)</label>
            <input type="number" defaultValue={80} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900" />
            <p className="text-[11px] text-slate-400 mt-1">Students scoring above this threshold will immediately flag alerts to assigned coaches.</p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Inactivity Threshold (Days)</label>
            <input type="number" defaultValue={7} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900" />
          </div>
        </div>

        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
