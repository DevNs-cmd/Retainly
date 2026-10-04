'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { CampaignsService } from '../../../../services/campaigns.service';
import { RetentionCampaign } from '../../../../types/campaign';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<RetentionCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaign() {
      try {
        setLoading(true);
        setError(null);
        const data = await CampaignsService.getCampaignById(params.id);
        setCampaign(data);
      } catch (err: any) {
        console.error('Failed to load campaign:', err);
        setError(err?.message || 'Campaign not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Loading campaign details...
        </p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-6 font-sans">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaigns</span>
        </Link>
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error || 'Campaign not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-500 mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campaigns</span>
      </Link>

      <div
        className="p-6 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-card)',
        }}
      >
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
            {campaign.status}
          </span>
          <h1 className="text-xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {campaign.name}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {campaign.description}
          </p>
        </div>

        <div className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>
          <p>Created: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.createdAt}</span></p>
          <p className="mt-1">Audience: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.audience}</span></p>
        </div>
      </div>

      {/* Funnel Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Emails Sent
          </span>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {campaign.sentCount.toLocaleString()}
          </div>
        </div>

        <div
          className="p-5 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Opened Rate
          </span>
          <div className="text-2xl font-bold text-amber-500 mt-1">
            {campaign.sentCount > 0 ? Math.round((campaign.openedCount / campaign.sentCount) * 100) : 0}%
          </div>
        </div>

        <div
          className="p-5 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Students Recovered
          </span>
          <div className="text-2xl font-bold text-emerald-500 mt-1">
            {campaign.recoveredCount}
          </div>
        </div>

        <div
          className="p-5 rounded-2xl border shadow-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Revenue Recovered
          </span>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            ${campaign.recoveredRevenue.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
