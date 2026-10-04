'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Sparkles, ShieldCheck, Loader2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { BillingService, BackendBillingSubscription, SUBSCRIPTION_PLANS, PlanTier } from '../../../services/billing.service';
import { useToast } from '../../../context/ToastContext';

export default function BillingPage() {
  const [data, setData] = useState<BackendBillingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await BillingService.getSubscription();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load billing subscription:', err);
      setError(err?.message || 'Failed to load subscription information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleSelectPlan = async (tier: PlanTier) => {
    try {
      setActionLoading(`checkout-${tier}`);
      const res = await BillingService.createCheckout(tier);
      if (res?.url) {
        window.location.href = res.url;
      } else {
        success('Plan Selected', `Checkout session requested for ${tier}.`);
      }
    } catch (err: any) {
      console.error('Checkout failed:', err);
      toastError('Checkout Error', err?.message || 'Stripe payments are not configured or available.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading('portal');
      const res = await BillingService.openCustomerPortal();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        success('Billing Portal', 'Redirecting to customer billing portal.');
      }
    } catch (err: any) {
      console.error('Portal failed:', err);
      toastError('Billing Portal', err?.message || 'No active Stripe billing customer on file.');
    } finally {
      setActionLoading(null);
    }
  };

  const currentTier = data?.planTier || 'PRO';
  const currentPlanMeta = SUBSCRIPTION_PLANS.find((p) => p.tier === currentTier) || SUBSCRIPTION_PLANS[2];

  const studentsPct = data ? Math.min(100, Math.round((data.usage.students / Math.max(1, data.limits.students)) * 100)) : 0;
  const coursesPct = data ? Math.min(100, Math.round((data.usage.courses / Math.max(1, data.limits.courses)) * 100)) : 0;
  const emailsPct = data ? Math.min(100, Math.round((data.usage.emails / Math.max(1, data.limits.emails)) * 100)) : 0;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Billing & Subscription
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Manage workspace subscription plan, real-time usage meters, and payment tiers.
          </p>
        </div>

        <button
          onClick={loadBillingData}
          disabled={loading}
          className="p-2.5 rounded-xl border hover:opacity-80 transition-all flex items-center justify-center disabled:opacity-50 self-start sm:self-auto"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-card)',
            color: 'var(--text-secondary)',
          }}
          title="Refresh billing data"
          aria-label="Refresh billing data"
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
            onClick={loadBillingData}
            className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Loading subscription usage and plans...
          </p>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Current Plan & Usage Summary Box */}
          <div
            className="p-6 rounded-2xl border shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6 transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-card)',
            }}
          >
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                CURRENT PLAN
              </span>
              <h2 className="text-2xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                {currentPlanMeta.name}
              </h2>
              <p className="text-xl font-bold text-amber-500 mt-0.5">
                {currentPlanMeta.price}{' '}
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  {currentPlanMeta.period}
                </span>
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Billing Period: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{data.usage.period}</span>
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading === 'portal'}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {actionLoading === 'portal' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Manage Billing</span>
                </button>
              </div>
            </div>

            {/* Usage Progress Meters */}
            <div
              className="lg:col-span-2 space-y-4 justify-center flex flex-col border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                Live Workspace Usage Metering
              </h3>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Active Students Tracked</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {data.usage.students.toLocaleString()} / {data.limits.students.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(2, studentsPct)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Courses Tracked</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {data.usage.courses.toLocaleString()} / {data.limits.courses.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(2, coursesPct)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Retention Outreach Emails</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {data.usage.emails.toLocaleString()} / {data.limits.emails.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(2, emailsPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Plan Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = plan.tier === currentTier;
              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                    isCurrent ? 'ring-2 ring-amber-500 shadow-md' : 'shadow-xs'
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: isCurrent ? 'var(--color-amber-500, #f59e0b)' : 'var(--border-card)',
                  }}
                >
                  <div>
                    {plan.isPopular && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider inline-block">
                        MOST POPULAR
                      </span>
                    )}
                    <h3 className="text-lg font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                      {plan.name}
                    </h3>
                    <p className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>
                      {plan.price}{' '}
                      <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                        {plan.period}
                      </span>
                    </p>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                      {plan.description}
                    </p>

                    <ul className="space-y-2 mt-4 pt-4 border-t text-xs" style={{ borderColor: 'var(--border-subtle)' }}>
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.tier)}
                    disabled={isCurrent || actionLoading === `checkout-${plan.tier}`}
                    className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      isCurrent
                        ? 'opacity-60 cursor-default'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-sm'
                    }`}
                    style={
                      isCurrent
                        ? {
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-card)',
                          }
                        : {}
                    }
                  >
                    {actionLoading === `checkout-${plan.tier}` && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isCurrent ? 'Current Plan' : 'Select Plan'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
