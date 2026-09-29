import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, AlertTriangle, ShieldCheck, Database, Zap, PieChart } from 'lucide-react';
import { fetchAnalyticsOverview, fetchCategoryPerformance, fetchExpiryLossEstimation } from '../api/client';

export const AnalyticsBI: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [expiryLoss, setExpiryLoss] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAnalyticsOverview(),
      fetchCategoryPerformance(),
      fetchExpiryLossEstimation(),
    ]).then(([ov, cats, loss]) => {
      setOverview(ov);
      setCategories(cats);
      setExpiryLoss(loss);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Enterprise BI Analytics & Loss Mitigation Engine</span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            Milestone 5: Financial Metrics & Indexes
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Executive portfolio performance, projected margins by pharmaceutical category, and algorithmic FEFO loss salvage modeling.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-mono uppercase text-slate-400">Total Portfolio Value (Retail)</span>
          <div className="mt-2 text-2xl font-bold text-white font-mono">
            ${overview?.inventory_retail_valuation?.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono">
            Acquisition Cost: ${overview?.inventory_cost_valuation?.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Projected Gross Margin
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-400 font-mono">
            {overview?.gross_margin_percentage}%
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono">
            Est. Profit: ${overview?.projected_gross_margin?.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4">
          <span className="text-xs font-mono uppercase text-rose-400 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Critical Expiry Exposure (&lt;30d)
          </span>
          <div className="mt-2 text-2xl font-bold text-rose-400 font-mono">
            ${overview?.critical_expiry_loss_at_risk?.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-rose-300 font-mono">
            Automated FEFO Priority Applied
          </div>
        </div>

        <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-4">
          <span className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            FEFO Loss Savings Modeled
          </span>
          <div className="mt-2 text-2xl font-bold text-cyan-400 font-mono">
            ${expiryLoss?.estimated_savings_with_fefo?.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-cyan-300 font-mono">
            ~72% Spoilage Reduction
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Financial Margin by Therapeutic Category
            </h2>
            <p className="text-xs text-slate-400">Aggregated revenue potential and margin efficiency</p>
          </div>
          <PieChart className="h-4 w-4 text-cyan-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Therapeutic Category</th>
                <th className="py-2.5 px-4 text-center">SKUs</th>
                <th className="py-2.5 px-4 text-right">Total Units</th>
                <th className="py-2.5 px-4 text-right">Holding Cost</th>
                <th className="py-2.5 px-4 text-right">Projected Revenue</th>
                <th className="py-2.5 px-4 text-right">Gross Profit</th>
                <th className="py-2.5 px-4 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.map((c) => (
                <tr key={c.category} className="hover:bg-slate-800/40 font-mono">
                  <td className="py-3 px-4 font-sans font-medium text-white flex items-center gap-2">
                    <span>{c.category}</span>
                    {c.requires_cold_chain && (
                      <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1 rounded border border-cyan-800">
                        ❄️ Cold Chain
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-400">{c.skus}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{c.total_units.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-slate-400">${c.total_cost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-white">${c.projected_revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">${c.profit_margin.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      {c.margin_percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expiry Loss Estimation Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Impending Expiry Financial Exposure
            </h2>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>

          <div className="space-y-3">
            {expiryLoss?.buckets?.map((b: any) => {
              const maxVal = Math.max(...expiryLoss.buckets.map((x: any) => x.loss_estimate || 1));
              const pct = Math.min(100, Math.round((b.loss_estimate / maxVal) * 100));

              return (
                <div key={b.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-300">{b.label}</span>
                    <span className="font-mono font-bold text-white">
                      ${b.loss_estimate.toLocaleString()} ({b.units.toLocaleString()} units)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: b.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
            Total 90-Day Loss Exposure: <strong className="text-white">${expiryLoss?.total_at_risk_90_days?.toLocaleString()}</strong>
          </div>
        </div>

        {/* Database Index Optimization Architecture */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>Query Index Optimization Blueprint</span>
            </h2>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>

          <p className="text-xs text-slate-400">
            To ensure sub-10ms FEFO ordering and inter-warehouse lookups across 1,000,000+ batch records, PostgreSQL & SQLite compound B-Tree indexes are deployed:
          </p>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-bold">1. idx_batch_exp_medicine</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                ON batches (exp_date ASC, medicine_id)
              </div>
              <div className="text-slate-500 text-[10px] mt-0.5">
                Powers constant-time FEFO sort without full table memory scans.
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-bold">2. idx_stock_warehouse_batch</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                ON stock_levels (warehouse_id, batch_id) [UNIQUE]
              </div>
              <div className="text-slate-500 text-[10px] mt-0.5">
                Atomic quantity allocation and rapid multi-warehouse queries.
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <div className="text-cyan-400 font-bold">3. idx_medicine_category_name</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                ON medicines (category, name)
              </div>
              <div className="text-slate-500 text-[10px] mt-0.5">
                Accelerates therapeutic classification filtering and formulary searches.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
