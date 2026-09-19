'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2, TrendingUp, DollarSign, Users } from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../../../../mock/campaigns';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === params.id) || MOCK_CAMPAIGNS[0];

  return (
    <div className="space-y-6 font-sans">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campaigns</span>
      </Link>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
            {campaign.status}
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">{campaign.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{campaign.description}</p>
        </div>

        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs">
          Edit Campaign
        </button>
      </div>

      {/* Funnel Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Emails Sent</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{campaign.sentCount.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Opened Rate</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {Math.round((campaign.openedCount / campaign.sentCount) * 100)}%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Students Recovered</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{campaign.recoveredCount}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Revenue Recovered</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">${campaign.recoveredRevenue.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
