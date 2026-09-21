'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Plus, TrendingUp, DollarSign, Users, ArrowRight, X } from 'lucide-react';
import { MOCK_CAMPAIGNS } from '../../../mock/campaigns';
import { RetentionCampaign } from '../../../types/campaign';
import { useToast } from '../../../context/ToastContext';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<RetentionCampaign[]>(MOCK_CAMPAIGNS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New campaign state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTrigger, setNewTrigger] = useState('INACTIVITY');
  const [newChannel, setNewChannel] = useState<'EMAIL' | 'SMS' | 'IN_APP'>('EMAIL');

  const { success } = useToast();

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const campaign: RetentionCampaign = {
      id: `camp-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Automated AI retention sequence.',
      trigger: newTrigger,
      audience: 'At-Risk Students',
      status: 'Active',
      sentCount: 0,
      openedCount: 0,
      engagedCount: 0,
      recoveredCount: 0,
      recoveredRevenue: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCampaigns([campaign, ...campaigns]);
    setIsModalOpen(false);
    setNewName('');
    setNewDesc('');
    success('Retention campaign created', `"${campaign.name}" is now live and monitoring student drop-offs.`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Retention & Win-Back Campaigns
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Automated recovery sequences triggered by behavioral drops and AI risk spikes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="p-6 rounded-2xl border shadow-xs space-y-4 transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  {campaign.status}
                </span>
                <h3 className="text-base font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                  {campaign.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {campaign.description}
                </p>
              </div>

              <Link
                href={`/campaigns/${campaign.id}`}
                className="w-8 h-8 rounded-xl flex items-center justify-center border hover:opacity-80 transition-all"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)',
                }}
                aria-label={`View ${campaign.name} details`}
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Campaign Funnel Stats */}
            <div
              className="grid grid-cols-4 gap-2 pt-3 border-t text-center"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Sent
                </span>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {campaign.sentCount.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                  Opened
                </span>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {campaign.openedCount.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-500 dark:text-amber-400">
                  Engaged
                </span>
                <p className="text-sm font-bold mt-0.5 text-amber-500 dark:text-amber-400">
                  {campaign.engagedCount.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-500 dark:text-emerald-400">
                  Recovered
                </span>
                <p className="text-sm font-bold mt-0.5 text-emerald-500 dark:text-emerald-400">
                  ${campaign.recoveredRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-labelledby="campaign-modal-title"
            aria-modal="true"
            className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="campaign-modal-title" className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Create Retention Sequence
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7-Day Inactivity Win Back"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
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
                  Trigger Condition
                </label>
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="INACTIVITY">Student Inactive &gt; 7 Days</option>
                  <option value="FAILED_QUIZ">Quiz / Assessment Failed 2+ Times</option>
                  <option value="EXPIRING_SUB">Auto-Renew Disabled / Sub Expiring</option>
                  <option value="VIDEO_DROP">Video Drop-off at bottleneck &gt; 60%</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Delivery Channel
                </label>
                <select
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="EMAIL">Email Sequence + Coach Note</option>
                  <option value="SMS">SMS Urgent Alert</option>
                  <option value="IN_APP">In-App Banner Notification</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Description / Goal
                </label>
                <textarea
                  rows={2}
                  placeholder="Goal of this campaign and recovery incentive offered..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
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
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
