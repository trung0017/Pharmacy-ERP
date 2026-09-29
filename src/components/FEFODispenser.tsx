import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Snowflake, Info, Printer } from 'lucide-react';
import { Medicine, Warehouse, FEFOResult } from '../types';
import { fetchMedicines, fetchWarehouses, fetchFEFORecommendation } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

interface FEFODispenserProps {
  initialMedicineId?: number;
}

export const FEFODispenser: React.FC<FEFODispenserProps> = ({ initialMedicineId }) => {
  const { t } = useLanguage();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | undefined>(initialMedicineId);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(100);
  const [loading, setLoading] = useState(false);
  const [fefoResult, setFefoResult] = useState<FEFOResult | null>(null);
  const [dispenseSuccess, setDispenseSuccess] = useState(false);

  useEffect(() => {
    Promise.all([fetchMedicines(), fetchWarehouses()]).then(([meds, whs]) => {
      setMedicines(meds);
      setWarehouses(whs);
      if (initialMedicineId) {
        setSelectedMedicineId(initialMedicineId);
      } else if (meds.length > 0) {
        setSelectedMedicineId(meds[0].id);
      }
    });
  }, [initialMedicineId]);

  const handleCalculateFEFO = async () => {
    if (!selectedMedicineId || quantity <= 0) return;
    try {
      setLoading(true);
      setDispenseSuccess(false);
      const res = await fetchFEFORecommendation(selectedMedicineId, quantity, selectedWarehouseId);
      setFefoResult(res);
    } catch (err: any) {
      alert(err.message || 'Error executing FEFO algorithm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMedicineId) {
      handleCalculateFEFO();
    }
  }, [selectedMedicineId, selectedWarehouseId]);

  const selectedMed = medicines.find((m) => m.id === selectedMedicineId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{t.fefoTitle}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            {t.fefoBadge}
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          {t.fefoSubtitle}
        </p>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Medicine Selection */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
              {t.step1SelectMed}
            </label>
            <select
              value={selectedMedicineId || ''}
              onChange={(e) => setSelectedMedicineId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:ring-1 focus:ring-cyan-500"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.strength}) - Stock: {m.total_stock}
                </option>
              ))}
            </select>
          </div>

          {selectedMed && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>{t.colCategory}:</span>
                <span className="text-slate-200">{selectedMed.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit Cost / Retail:</span>
                <span className="text-slate-200 font-mono">${selectedMed.cost_price} / ${selectedMed.unit_price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{t.storageReq}</span>
                <span className={`inline-flex items-center gap-1 font-mono text-[11px] ${selectedMed.requires_cold_chain ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {selectedMed.requires_cold_chain ? (
                    <>
                      <Snowflake className="h-3 w-3" />
                      {t.coldStorage}
                    </>
                  ) : (
                    t.ambientStorage
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Facility & Quantity Input */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                {t.step2Warehouse}
              </label>
              <select
                value={selectedWarehouseId || ''}
                onChange={(e) => setSelectedWarehouseId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">{t.allFacilities}</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">
                {t.step3Quantity}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-sm rounded-lg p-2 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={handleCalculateFEFO}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs rounded-lg transition disabled:opacity-50 shrink-0"
                >
                  {loading ? t.btnSolving : t.btnRunFefo}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500">
            * FEFO Algorithm: Sorts active stock by Expiry Date ASC.
          </div>
        </div>

        {/* Allocation Summary Card */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">{t.fefoSummary}</span>
              <Activity className="h-4 w-4 text-cyan-400" />
            </div>

            {fefoResult ? (
              <div className="mt-3 space-y-2 font-mono">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">{t.targetDemand}</span>
                  <span className="text-sm font-bold text-white">{fefoResult.requested_quantity} {t.units}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">{t.allocatedViaFefo}</span>
                  <span className="text-sm font-bold text-cyan-400">{fefoResult.allocated_quantity} {t.units}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">{t.unfulfilledGap}</span>
                  <span className={`text-sm font-bold ${fefoResult.unfulfilled_quantity > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {fefoResult.unfulfilled_quantity} {t.units}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">{t.totalPickCost}</span>
                  <span className="text-sm font-bold text-white">
                    ${fefoResult.allocations.reduce((sum, a) => sum + a.total_cost, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center text-xs text-slate-500">
                Awaiting calculation parameters...
              </div>
            )}
          </div>

          {fefoResult && fefoResult.allocations.length > 0 && (
            <button
              onClick={() => setDispenseSuccess(true)}
              className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{t.btnConfirmPick}</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Banner */}
      {dispenseSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500 text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">
              {t.pickSuccessBanner}
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1 bg-emerald-600 text-white rounded text-xs flex items-center gap-1 hover:bg-emerald-500"
          >
            <Printer className="h-3.5 w-3.5" />
            {t.btnPrintPickSheet}
          </button>
        </div>
      )}

      {/* FEFO Pick Sequence List */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              {t.recommendedPickSeq}
            </h2>
            {fefoResult?.notes && (
              <p className="text-xs text-cyan-300 mt-0.5 flex items-center gap-1">
                <Info className="h-3.5 w-3.5 inline" />
                {fefoResult.notes}
              </p>
            )}
          </div>
          <span className="text-xs font-mono text-slate-400">
            {fefoResult?.allocations.length || 0} {t.lots}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.colPriority}</th>
                <th className="py-3 px-4">{t.colBatchSku}</th>
                <th className="py-3 px-4">{t.colMfgDate}</th>
                <th className="py-3 px-4">{t.colExpiryDate}</th>
                <th className="py-3 px-4">{t.colDaysLeft}</th>
                <th className="py-3 px-4">{t.colFacilityBin}</th>
                <th className="py-3 px-4 text-right">{t.colAvailableInLot}</th>
                <th className="py-3 px-4 text-right font-bold text-cyan-400">{t.colPickQty}</th>
                <th className="py-3 px-4 text-right">{t.colSubtotal}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {!fefoResult || fefoResult.allocations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No active stock available for this medicine matching the criteria.
                  </td>
                </tr>
              ) : (
                fefoResult.allocations.map((alloc, idx) => {
                  const isCritical = alloc.days_to_expiry <= 30;
                  const isWarning = alloc.days_to_expiry > 30 && alloc.days_to_expiry <= 90;

                  return (
                    <tr
                      key={alloc.batch_id}
                      className={
                        isCritical
                          ? 'bg-rose-950/20'
                          : isWarning
                          ? 'bg-amber-950/15'
                          : 'hover:bg-slate-800/30'
                      }
                    >
                      <td className="py-3 px-4">
                        <span className="h-6 w-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 inline-flex items-center justify-center font-mono font-bold text-xs">
                          {idx + 1}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {alloc.batch_no}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">{alloc.mfg_date}</td>

                      <td className="py-3 px-4 font-mono text-slate-200">{alloc.exp_date}</td>

                      <td className="py-3 px-4">
                        {isCritical ? (
                          <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            {alloc.days_to_expiry}d ({t.priorityDispatch})
                          </span>
                        ) : isWarning ? (
                          <span className="font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {alloc.days_to_expiry}d ({t.filterWarning})
                          </span>
                        ) : (
                          <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {alloc.days_to_expiry}d ({t.filterValid})
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-300">{alloc.warehouse_name}</div>
                        <div className="font-mono text-[11px] text-cyan-400">{alloc.location_bin}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {alloc.available_in_batch.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-cyan-300 bg-cyan-950/30">
                        {alloc.quantity_to_dispense.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-200">
                        ${alloc.total_cost.toLocaleString()}
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
