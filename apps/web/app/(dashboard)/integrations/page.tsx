'use client';

import React, { useState } from 'react';
import { Blocks, CheckCircle2, Plus } from 'lucide-react';
import { MOCK_INTEGRATIONS } from '../../../mock/integrations';
import { IntegrationCategory } from '../../../types/integration';

const CATEGORIES: IntegrationCategory[] = ['Course Platforms', 'Email', 'Payments', 'Communication'];

export default function IntegrationsPage() {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  const filteredIntegrations = MOCK_INTEGRATIONS.filter((item) => selectedCat === 'ALL' || item.category === selectedCat);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integrations Marketplace</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Connect your LMS, email marketing tools, and payment gateways to Retainly.
        </p>
      </div>

      {/* Category Switcher Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCat('ALL')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            selectedCat === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Integrations
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              selectedCat === cat ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between">
                <div className="text-3xl">{item.logo}</div>
                {item.connected ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>CONNECTED</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-500">
                    NOT CONNECTED
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3">{item.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400">{item.category}</span>
              <button
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  item.connected
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {item.connected ? 'Configure' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
