'use client';

import React from 'react';
import { CreditCard, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { MOCK_BILLING_USAGE, MOCK_SUBSCRIPTION_PLANS } from '../../../mock/billing';

export default function BillingPage() {
  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Billing & Subscription</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your workspace subscription plan, usage limits, and payment methods.</p>
      </div>

      {/* Current Plan & Usage Summary Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
            CURRENT PLAN
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">Growth Plan</h2>
          <p className="text-xl font-bold text-indigo-600 mt-0.5">$99 <span className="text-xs text-slate-400 font-medium">/ month</span></p>
          <p className="text-xs text-slate-400 mt-2">Next billing date: October 1, 2026</p>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs">
              Upgrade Plan
            </button>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
              Manage Billing
            </button>
          </div>
        </div>

        {/* Usage Progress Meters (Section 22) */}
        <div className="lg:col-span-2 space-y-4 justify-center flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Plan Usage Metering</h3>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Active Students Tracked</span>
              <span className="text-slate-900">{MOCK_BILLING_USAGE.studentsCurrent.toLocaleString()} / {MOCK_BILLING_USAGE.studentsLimit.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(MOCK_BILLING_USAGE.studentsCurrent / MOCK_BILLING_USAGE.studentsLimit) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Automated Campaigns</span>
              <span className="text-slate-900">{MOCK_BILLING_USAGE.campaignsCurrent} / {MOCK_BILLING_USAGE.campaignsLimit}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(MOCK_BILLING_USAGE.campaignsCurrent / MOCK_BILLING_USAGE.campaignsLimit) * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Retention Automations</span>
              <span className="text-slate-900">{MOCK_BILLING_USAGE.automationsCurrent} / {MOCK_BILLING_USAGE.automationsLimit}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(MOCK_BILLING_USAGE.automationsCurrent / MOCK_BILLING_USAGE.automationsLimit) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white p-6 rounded-2xl border ${
              plan.isCurrent ? 'border-2 border-indigo-600 shadow-md' : 'border-slate-200/80 shadow-xs'
            } flex flex-col justify-between space-y-4`}
          >
            <div>
              {plan.isPopular && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900 mt-2">{plan.name}</h3>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {plan.price} <span className="text-xs text-slate-400 font-normal">{plan.period}</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">{plan.description}</p>

              <ul className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                plan.isCurrent
                  ? 'bg-slate-100 text-slate-500 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {plan.isCurrent ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
