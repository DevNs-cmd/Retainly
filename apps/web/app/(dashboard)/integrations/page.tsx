'use client';

import React, { useState, useEffect } from 'react';
import { Blocks, CheckCircle2, Plus, Loader2, AlertCircle, RefreshCw, X, RotateCw, PowerOff } from 'lucide-react';
import { IntegrationsService } from '../../../services/integrations.service';
import { IntegrationCategory, IntegrationItem } from '../../../types/integration';
import { useToast } from '../../../context/ToastContext';

const CATEGORIES: IntegrationCategory[] = ['Course Platforms', 'Email', 'Payments', 'Communication'];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  // Connect dialog state
  const [activeItem, setActiveItem] = useState<IntegrationItem | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const catalog = await IntegrationsService.getCatalog();
      setIntegrations(catalog);
    } catch (err: any) {
      console.error('Failed to load integrations:', err);
      setError(err?.message || 'Failed to load integrations catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !apiKey.trim()) return;

    try {
      setConnecting(true);
      await IntegrationsService.connect(activeItem.id, { apiKey: apiKey.trim() });
      success('Connected', `Successfully connected ${activeItem.name}.`);
      setActiveItem(null);
      setApiKey('');
      await loadIntegrations();
    } catch (err: any) {
      console.error('Connect failed:', err);
      toastError('Connection Failed', err?.message || 'Could not connect integration credentials.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (item: IntegrationItem) => {
    if (!confirm(`Are you sure you want to disconnect ${item.name}?`)) return;

    try {
      await IntegrationsService.disconnect(item.id);
      success('Disconnected', `${item.name} has been disconnected.`);
      await loadIntegrations();
    } catch (err: any) {
      console.error('Disconnect failed:', err);
      toastError('Disconnect Failed', err?.message || 'Could not disconnect integration.');
    }
  };

  const handleSync = async (item: IntegrationItem) => {
    try {
      setSyncingId(item.id);
      await IntegrationsService.sync(item.id);
      success('Sync Triggered', `Data synchronization queued for ${item.name}.`);
    } catch (err: any) {
      console.error('Sync failed:', err);
      toastError('Sync Failed', err?.message || 'Synchronization could not be queued.');
    } finally {
      setSyncingId(null);
    }
  };

  const filteredIntegrations = integrations.filter((item) => selectedCat === 'ALL' || item.category === selectedCat);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Integrations Marketplace
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Connect your LMS, email marketing tools, and payment gateways to Retainly.
          </p>
        </div>

        <button
          onClick={loadIntegrations}
          disabled={loading}
          className="p-2.5 rounded-xl border hover:opacity-80 transition-all flex items-center justify-center disabled:opacity-50 self-start sm:self-auto"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-card)',
            color: 'var(--text-secondary)',
          }}
          title="Refresh integrations"
          aria-label="Refresh integrations"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadIntegrations}
            className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Category Switcher Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCat('ALL')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            selectedCat === 'ALL'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'border hover:opacity-80'
          }`}
          style={
            selectedCat !== 'ALL'
              ? {
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)',
                }
              : {}
          }
        >
          All Integrations
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              selectedCat === cat
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'border hover:opacity-80'
            }`}
            style={
              selectedCat !== cat
                ? {
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-secondary)',
                  }
                : {}
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Loading platform integrations...
          </p>
        </div>
      )}

      {/* Integrations Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border shadow-xs flex flex-col justify-between space-y-4 transition-colors"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-card)',
              }}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="text-3xl">{item.logo}</div>
                  {item.connected ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>CONNECTED</span>
                    </span>
                  ) : (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold"
                      style={{
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      NOT CONNECTED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {item.name}
                  </h3>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {item.description}
                </p>
              </div>

              <div
                className="pt-3 border-t flex items-center justify-between text-xs"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                  {item.category}
                </span>

                <div className="flex items-center gap-2">
                  {item.connected ? (
                    <>
                      {['kajabi', 'teachable', 'thinkific', 'podia', 'learnworlds', 'stripe', 'paypal'].includes(item.id) && (
                        <button
                          onClick={() => handleSync(item)}
                          disabled={syncingId === item.id}
                          className="px-2.5 py-1.5 rounded-xl border hover:opacity-80 transition-opacity flex items-center gap-1"
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            borderColor: 'var(--border-card)',
                            color: 'var(--text-secondary)',
                          }}
                          title="Sync records"
                          aria-label={`Sync ${item.name}`}
                        >
                          <RotateCw className={`w-3 h-3 ${syncingId === item.id ? 'animate-spin' : ''}`} />
                          <span>Sync</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDisconnect(item)}
                        className="px-3 py-1.5 rounded-xl border text-rose-500 hover:bg-rose-500/10 transition-colors"
                        style={{
                          borderColor: 'var(--border-card)',
                        }}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveItem(item)}
                      className="px-4 py-1.5 rounded-xl font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-xs transition-all"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connect Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-labelledby="connect-modal-title"
            aria-modal="true"
            className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="connect-modal-title" className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span>{activeItem.logo}</span>
                <span>Connect {activeItem.name}</span>
              </h3>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConnectSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  API Key / Access Token
                </label>
                <input
                  type="password"
                  required
                  placeholder={`Enter your ${activeItem.name} API Key`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-input)',
                    color: 'var(--text-primary)',
                  }}
                />
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Credentials will be AES-256 encrypted and stored securely in Retainly Vault.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  disabled={connecting}
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
                  disabled={connecting}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{connecting ? 'Connecting...' : 'Save & Connect'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
