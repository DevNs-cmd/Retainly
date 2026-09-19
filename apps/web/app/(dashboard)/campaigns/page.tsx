'use client';

import React from 'react';
import Link from 'next/link';
import { Send, Plus, TrendingUp, DollarSign, Users, ArrowRight } from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../../../mock/campaigns';

export default function CampaignsPage() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Retention Campaigns</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated win-back and intervention campaigns powered by AI triggers.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_CAMPAIGNS.map((campaign) => (
          <div key={campaign.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  {campaign.status}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{campaign.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{campaign.description}</p>
              </div>

              <Link
                href={`/campaigns/${campaign.id}`}
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-slate-200 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Campaign Funnel Stats */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Sent</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{campaign.sentCount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Opened</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{campaign.openedCount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-indigo-600 font-bold uppercase">Engaged</span>
                <p className="text-sm font-bold text-indigo-600 mt-0.5">{campaign.engagedCount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 font-bold uppercase">Recovered</span>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">${campaign.recoveredRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
