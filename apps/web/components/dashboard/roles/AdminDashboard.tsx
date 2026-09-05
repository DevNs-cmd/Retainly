'use client';

import React from 'react';
import { Sliders, ShieldCheck, Blocks, Users, CheckCircle2, AlertTriangle, Key, Cpu } from 'lucide-react';
import Link from 'next/link';

export function AdminDashboard() {
  return (
    <div className="space-y-6 font-sans">
      {/* Role Notice Banner */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs font-medium text-purple-950">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-600"></span>
          <span><strong>ADMIN VIEW:</strong> Workspace operations, integration status, AI risk thresholds, and security controls.</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">System Admin</span>
      </div>

      {/* Admin KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Connected Integrations</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">4 / 7</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Kajabi, ConvertKit, Stripe, Slack</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Active Team Members</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">3 Coaches</div>
          <span className="text-[11px] text-slate-400">All roles verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">AI Risk Model Sensitivity</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">Score &gt; 80</div>
          <span className="text-[11px] text-slate-400">Auto-flag enabled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">System Uptime</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">99.98%</div>
          <span className="text-[11px] text-slate-400">Real-time webhook sync</span>
        </div>
      </div>

      {/* Main Admin Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integrations Health */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Integrations Sync Status</h3>
            <Link href="/integrations" className="text-xs font-bold text-indigo-600 hover:underline">
              Manage Marketplace →
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🎓</span>
                <div>
                  <h4 className="font-bold text-slate-900">Kajabi LMS Sync</h4>
                  <p className="text-[11px] text-slate-400">Student enrollments & video watch metrics</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE · Synced 10m ago
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">💳</span>
                <div>
                  <h4 className="font-bold text-slate-900">Stripe Billing Webhook</h4>
                  <p className="text-[11px] text-slate-400">Failed payment triggers & renewal dates</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE · Synced Just now
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">✉️</span>
                <div>
                  <h4 className="font-bold text-slate-900">ConvertKit Email Marketing</h4>
                  <p className="text-[11px] text-slate-400">Win-back email tags & automation sequences</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE · Synced 25m ago
              </span>
            </div>
          </div>
        </div>

        {/* Security & Audit Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Admin Controls</h3>

          <div className="space-y-2">
            <Link href="/settings" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <h4 className="text-xs font-bold text-slate-900">Configure Risk Thresholds</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Adjust AI sensitivity for flagging high risk students</p>
            </Link>

            <Link href="/team" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <h4 className="text-xs font-bold text-slate-900">Team Permissions</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Invite coaches and assign student cohorts</p>
            </Link>

            <Link href="/billing" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
              <h4 className="text-xs font-bold text-slate-900">Usage Metering</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">3,240 / 5,000 active students tracked</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
