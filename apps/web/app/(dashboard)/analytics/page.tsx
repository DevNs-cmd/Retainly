'use client';

import React, { useState, useEffect } from 'react';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { AnalyticsTimeRange, AnalyticsSourceData } from '../../../types/analytics';
import { AnalyticsService } from '../../../services/analytics.service';
import { AnalyticsRetentionGraph } from '../../../components/analytics/AnalyticsRetentionGraph';
import { AnalyticsRevenueGraph } from '../../../components/analytics/AnalyticsRevenueGraph';
import { CohortRetentionGraph } from '../../../components/analytics/CohortRetentionGraph';

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsTimeRange>('30D');
  const [data, setData] = useState<AnalyticsSourceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const result = await AnalyticsService.getAnalytics(range);
        if (isMounted) {
          setData(result);
        }
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [range]);

  const handleExport = () => {
    if (!data) return;
    setExporting(true);
    try {
      AnalyticsService.downloadCSV(data);
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Churn Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep-dive metrics into cohort retention, revenue recovery, and campaign ROI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            {(['7D', '30D', '90D', '12M'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                disabled={loading}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  range === r
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExport}
            disabled={!data || exporting}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-all shadow-xs"
          >
            {exporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80"></div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-2xl border border-slate-200/80"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white rounded-2xl border border-slate-200/80"></div>
            <div className="h-80 bg-white rounded-2xl border border-slate-200/80"></div>
          </div>
        </div>
      )}

      {/* Main Analytics Content */}
      {data && (
        <div className="space-y-6">
          {/* Analytics KPI Row (Dynamically populated from data source) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Retention Rate</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {data.summary.retentionRate}%
              </div>
              <span className={`text-[11px] font-semibold ${data.summary.retentionRateDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.summary.retentionRateDelta >= 0 ? `+${data.summary.retentionRateDelta}%` : `${data.summary.retentionRateDelta}%`} vs prior period
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Churn Rate</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {data.summary.churnRate}%
              </div>
              <span className={`text-[11px] font-semibold ${data.summary.churnRateDelta <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {data.summary.churnRateDelta}% vs prior period
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Recovered Revenue</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                ${data.summary.recoveredRevenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">
                +{data.summary.recoveredRevenueDelta}% vs prior period
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Campaign ROI</span>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                {data.summary.campaignRoi}x
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                +{data.summary.campaignRoiDelta}x vs software cost
              </span>
            </div>
          </div>

          {/* Primary Graph: Retention vs Churn Trend Area Chart */}
          <AnalyticsRetentionGraph
            data={data.retentionTrend}
            range={data.range}
          />

          {/* Secondary Dual Graphs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Revenue Recovery & At-Risk Revenue Graph */}
            <AnalyticsRevenueGraph
              data={data.revenueTrend}
              range={data.range}
            />

            {/* Cohort Retention Decay Curve Graph */}
            <CohortRetentionGraph
              cohorts={data.cohortRetention}
            />
          </div>
        </div>
      )}
    </div>
  );
}
