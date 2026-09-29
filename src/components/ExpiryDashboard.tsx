import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Snowflake, Search, ArrowRight, ShieldAlert } from 'lucide-react';
import { Warehouse } from '../types';
import { fetchExpiryDashboard, fetchWarehouses } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

interface ExpiryDashboardProps {
  onDispenseSelect?: (medicineId: number) => void;
}

export const ExpiryDashboard: React.FC<ExpiryDashboardProps> = ({ onDispenseSelect }) => {
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'valid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, whs] = await Promise.all([
        fetchExpiryDashboard(selectedWarehouse),
        fetchWarehouses(),
      ]);
      setDashboardData(dash);
      setWarehouses(whs);
    } catch (err) {
      console.error('Error loading expiry dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWarehouse]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const criticalItems = dashboardData?.critical_items || [];
  const warningItems = dashboardData?.warning_items || [];
  const validItems = dashboardData?.valid_items_sample || [];

  let displayedItems: any[] = [];
  if (activeFilter === 'all') {
    displayedItems = [...criticalItems, ...warningItems, ...validItems];
  } else if (activeFilter === 'critical') {
    displayedItems = criticalItems;
  } else if (activeFilter === 'warning') {
    displayedItems = warningItems;
  } else if (activeFilter === 'valid') {
    displayedItems = validItems;
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedItems = displayedItems.filter(
      (item) =>
        item.medicine_name.toLowerCase().includes(q) ||
        item.batch_no.toLowerCase().includes(q) ||
        item.medicine_code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t.expiryRadarTitle}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-normal">
              FEFO Live
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            {t.expiryRadarSubtitle}
          </p>
        </div>

        {/* Warehouse Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">{t.warehouseFilter}</label>
          <select
            value={selectedWarehouse || ''}
            onChange={(e) => setSelectedWarehouse(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="">{t.allFacilities}</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards (Color-Coded Status) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Critical Red (<30 days) */}
        <div
          onClick={() => setActiveFilter('critical')}
          className={`cursor-pointer rounded-xl p-4 transition border ${
            activeFilter === 'critical'
              ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
              : 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-rose-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              {t.criticalExpiry}
            </span>
            <AlertCircle className="h-5 w-5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-mono">{summary.critical_batch_count || 0} {t.lots}</div>
            <div className="text-xs text-rose-300 font-mono">{summary.critical_units?.toLocaleString()} {t.units}</div>
          </div>
          <div className="mt-1 text-xs text-rose-400 font-mono">
            {t.lossAtRisk} ${summary.critical_value_at_risk?.toLocaleString()}
          </div>
        </div>

        {/* Warning Amber (<90 days) */}
        <div
          onClick={() => setActiveFilter('warning')}
          className={`cursor-pointer rounded-xl p-4 transition border ${
            activeFilter === 'warning'
              ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
              : 'bg-amber-950/20 border-amber-900/50 hover:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              {t.warningShelfLife}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-mono">{summary.warning_batch_count || 0} {t.lots}</div>
            <div className="text-xs text-amber-300 font-mono">{summary.warning_units?.toLocaleString()} {t.units}</div>
          </div>
          <div className="mt-1 text-xs text-amber-400 font-mono">
            {t.valueAtRisk} ${summary.warning_value_at_risk?.toLocaleString()}
          </div>
        </div>

        {/* Valid Green (>90 days) */}
        <div
          onClick={() => setActiveFilter('valid')}
          className={`cursor-pointer rounded-xl p-4 transition border ${
            activeFilter === 'valid'
              ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
              : 'bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {t.validShelfLife}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-mono">{summary.valid_batch_count || 0} {t.lots}</div>
            <div className="text-xs text-emerald-300 font-mono">{summary.valid_units?.toLocaleString()} {t.units}</div>
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-mono">
            {t.valuation} ${summary.valid_value?.toLocaleString()}
          </div>
        </div>

        {/* Total Portfolio Valuation */}
        <div
          onClick={() => setActiveFilter('all')}
          className={`cursor-pointer rounded-xl p-4 transition border ${
            activeFilter === 'all'
              ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-cyan-400">{t.totalMonitoredStock}</span>
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white font-mono">
              ${summary.total_inventory_value?.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 font-mono">{summary.total_stock_units?.toLocaleString()} {t.units}</div>
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono">
            {t.activeFefoPriority}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-mono">{t.filterStatus}</span>
          {(['all', 'critical', 'warning', 'valid'] as const).map((mode) => {
            const label = mode === 'all' ? t.filterAll : mode === 'critical' ? t.filterCritical : mode === 'warning' ? t.filterWarning : t.filterValid;
            return (
              <button
                key={mode}
                onClick={() => setActiveFilter(mode)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                  activeFilter === mode
                    ? mode === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : mode === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : mode === 'valid'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Batch Risk Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.colBatchSku}</th>
                <th className="py-3 px-4">{t.colMedicineForm}</th>
                <th className="py-3 px-4">{t.colCategory}</th>
                <th className="py-3 px-4">{t.colExpiryDate}</th>
                <th className="py-3 px-4">{t.colDaysLeft}</th>
                <th className="py-3 px-4">{t.colFacilityBin}</th>
                <th className="py-3 px-4 text-right">{t.colUnits}</th>
                <th className="py-3 px-4 text-right">{t.colCostValue}</th>
                <th className="py-3 px-4 text-center">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No batches match the selected criteria.
                  </td>
                </tr>
              ) : (
                displayedItems.map((item, idx) => {
                  const isCritical = item.days_to_expiry <= 30;
                  const isWarning = item.days_to_expiry > 30 && item.days_to_expiry <= 90;

                  return (
                    <tr
                      key={`${item.stock_id}-${idx}`}
                      className={`transition-colors ${
                        isCritical
                          ? 'bg-rose-950/15 hover:bg-rose-950/30'
                          : isWarning
                          ? 'bg-amber-950/10 hover:bg-amber-950/25'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-200">{item.batch_no}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.medicine_code}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-white flex items-center gap-1.5">
                          {item.medicine_name}
                          {item.requires_cold_chain && (
                            <span title={t.coldChainRequired} className="text-cyan-400">
                              <Snowflake className="h-3 w-3 inline" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-300">{item.exp_date}</td>

                      <td className="py-3 px-4">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
                            <AlertCircle className="h-3 w-3" />
                            {item.days_to_expiry}d ({t.critical})
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            <AlertTriangle className="h-3 w-3" />
                            {item.days_to_expiry}d ({t.filterWarning})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" />
                            {item.days_to_expiry}d ({t.filterValid})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300">{item.warehouse_name}</div>
                        <div className="text-[11px] font-mono text-cyan-400/80">{item.location_bin}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-200">
                        {item.quantity.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-200">
                        ${item.total_value.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onDispenseSelect && onDispenseSelect(item.medicine_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 transition"
                        >
                          <span>{t.btnFefoDispense}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
