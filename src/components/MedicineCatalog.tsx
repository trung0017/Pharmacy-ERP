import React, { useState, useEffect } from 'react';
import { Search, Snowflake, ChevronDown, ChevronUp } from 'lucide-react';
import { Medicine } from '../types';
import { fetchMedicines, fetchCategories } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

export const MedicineCatalog: React.FC = () => {
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMedId, setExpandedMedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMedicines(), fetchCategories()]).then(([meds, cats]) => {
      setMedicines(meds);
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  const filteredMedicines = medicines.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{t.catalogTitle}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            {medicines.length} {t.colSkus}
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          {t.catalogSubtitle}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder={t.searchFormulary}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
          <span className="text-xs text-slate-400 font-mono shrink-0">{t.colCategory}:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            {t.filterAll} ({medicines.length})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap ${
                selectedCategory === c
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMedicines.map((med) => {
          const isExpanded = expandedMedId === med.id;
          const profit = med.unit_price - med.cost_price;
          const margin = Math.round((profit / med.unit_price) * 100);

          return (
            <div
              key={med.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg hover:border-slate-700 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      {med.code}
                    </span>
                    <span className="text-xs text-slate-400">{med.dosage_form}</span>
                    {med.requires_cold_chain && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-700">
                        <Snowflake className="h-3 w-3" />
                        {t.coldStorage}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{med.name}</h3>
                  <p className="text-xs text-slate-400">
                    Generic: <span className="text-slate-300">{med.generic_name}</span> · {med.manufacturer}
                  </p>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-white">${med.unit_price.toFixed(2)}</div>
                  <div className="text-[11px] text-emerald-400">{t.margin}: {margin}%</div>
                </div>
              </div>

              {med.description && (
                <p className="text-xs text-slate-400 line-clamp-2 italic">
                  {med.description}
                </p>
              )}

              {/* Bottom bar with batch counts and expand toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-3 font-mono text-slate-300">
                  <span>
                    Total: <strong className="text-white">{med.total_stock.toLocaleString()}</strong> {t.units}
                  </span>
                  <span>
                    {t.lots}: <strong className="text-cyan-400">{med.batches.length}</strong>
                  </span>
                </div>

                <button
                  onClick={() => setExpandedMedId(isExpanded ? null : med.id)}
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <span>{isExpanded ? t.hideBatches : t.inspectBatches}</span>
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Expanded Batch Inspector */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                    {t.activeBatchesInDist}
                  </span>
                  <div className="space-y-1.5">
                    {med.batches.map((b) => {
                      const isCrit = (b.days_to_expiry ?? 999) <= 30;
                      const isWarn = (b.days_to_expiry ?? 999) > 30 && (b.days_to_expiry ?? 999) <= 90;

                      return (
                        <div
                          key={b.id}
                          className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-mono font-bold text-white flex items-center gap-2">
                              <span>{b.batch_no}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {t.initialUnits} {b.total_initial_quantity} {t.units}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Mfg: {b.mfg_date} · Exp: {b.exp_date}
                            </div>
                          </div>

                          <div>
                            {isCrit ? (
                              <span className="font-mono text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                                {b.days_to_expiry}d ({t.critical})
                              </span>
                            ) : isWarn ? (
                              <span className="font-mono text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                {b.days_to_expiry}d ({t.filterWarning})
                              </span>
                            ) : (
                              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                {b.days_to_expiry}d ({t.filterValid})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
