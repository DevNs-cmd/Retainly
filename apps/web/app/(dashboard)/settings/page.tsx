'use client';

import React, { useState } from 'react';
import { Settings, Shield, Bell, Save, CheckCircle2, Loader2, User } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useToast } from '../../../context/ToastContext';
import { ThemeSelector } from '../../../components/layout/ThemeSelector';

export default function SettingsPage() {
  const { theme, resolvedTheme } = useTheme();
  const { success } = useToast();

  const [saving, setSaving] = useState(false);
  const [criticalThreshold, setCriticalThreshold] = useState(80);
  const [inactivityDays, setInactivityDays] = useState(7);
  const [orgName, setOrgName] = useState('Acme Academy');
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success('Preferences saved successfully', 'Your workspace thresholds and display preferences have been updated.');
    }, 600);
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Workspace & Appearance Settings
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Manage your interface theme, AI churn detection thresholds, and workspace defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Theme & Appearance Section: Single Unified Expandable Control */}
        <div
          className="p-6 rounded-2xl border shadow-xs space-y-4 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Interface Appearance
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Choose between Light, Dark, or System mode. The interface adapts immediately.
              </p>
            </div>

            {/* Single Expandable Theme Control */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Theme:
              </span>
              <ThemeSelector align="right" />
            </div>
          </div>

          <div
            className="p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              {theme === 'system'
                ? `System mode is currently active (detected OS preference: ${resolvedTheme}).`
                : `${theme === 'dark' ? 'Dark' : 'Light'} mode is manually selected.`}
            </span>
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-subtle-text)',
                border: '1px solid var(--accent-subtle-border)',
              }}
            >
              {resolvedTheme} Mode
            </span>
          </div>
        </div>

        {/* 2. AI Risk Sensitivity Thresholds */}
        <div
          className="p-6 rounded-2xl border shadow-xs space-y-4 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              AI Risk Sensitivity & Triggers
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Define when student engagement drops are considered critical risks and trigger coach interventions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                Critical Churn Risk Score (0 - 100)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-semibold"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-input)',
                  color: 'var(--text-primary)',
                }}
              />
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Students scoring at or above this threshold trigger instant coach alert tasks.
              </p>
            </div>

            <div>
              <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                Inactivity Alert Threshold (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={inactivityDays}
                onChange={(e) => setInactivityDays(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-semibold"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-input)',
                  color: 'var(--text-primary)',
                }}
              />
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Flags student when no learning sessions or logins occur for this period.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Organization Profile & Notification Defaults */}
        <div
          className="p-6 rounded-2xl border shadow-xs space-y-4 transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Academy Profile & Notifications
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Configure your academy display name and alert channel preferences.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                Academy Workspace Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  borderColor: 'var(--border-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                  Email Digest & Critical Alerts
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Send coaches daily summaries when new high-risk students are detected.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-400/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-75"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
