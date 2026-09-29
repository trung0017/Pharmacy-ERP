import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertTriangle, Snowflake } from 'lucide-react';
import { Warehouse, Medicine, Batch } from '../types';
import { createTransferOrder } from '../api/client';

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  medicines: Medicine[];
  onSuccess: () => void;
}

export const CreateTransferModal: React.FC<CreateTransferModalProps> = ({
  isOpen,
  onClose,
  warehouses,
  medicines,
  onSuccess,
}) => {
  const [sourceId, setSourceId] = useState<number>(warehouses[0]?.id || 1);
  const [destId, setDestId] = useState<number>(warehouses[1]?.id || 2);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ batchId: number; quantity: number }[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number>(0);
  const [itemQty, setItemQty] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Collect all available batches across medicines
  const allBatches = medicines.flatMap((m) =>
    m.batches.map((b) => ({
      ...b,
      medicineName: m.name,
      medicineCode: m.code,
      requiresColdChain: m.requires_cold_chain,
    }))
  );

  useEffect(() => {
    if (allBatches.length > 0 && selectedBatchId === 0) {
      setSelectedBatchId(allBatches[0].id);
    }
  }, [medicines]);

  if (!isOpen) return null;

  const destWarehouse = warehouses.find((w) => w.id === destId);

  const handleAddItem = () => {
    if (!selectedBatchId || itemQty <= 0) return;
    const batchObj = allBatches.find((b) => b.id === selectedBatchId);
    if (!batchObj) return;

    // Check cold-chain constraint
    if (batchObj.requiresColdChain && destWarehouse && !destWarehouse.is_cold_storage) {
      setErrorMsg(`Cold-chain conflict: Destination '${destWarehouse.name}' has no cold-storage facility!`);
      return;
    }

    setErrorMsg('');
    setItems((prev) => [...prev, { batchId: selectedBatchId, quantity: itemQty }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceId === destId) {
      setErrorMsg('Source and Destination warehouses must be distinct.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Please add at least one medicine batch item to the transfer.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await createTransferOrder({
        source_warehouse_id: sourceId,
        destination_warehouse_id: destId,
        notes,
        items: items.map((i) => ({ batch_id: i.batchId, quantity_requested: i.quantity })),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit transfer order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Create Inter-Warehouse Transfer Order</span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              State: Draft
            </span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Origin Facility (Source)
              </label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.is_cold_storage ? '❄️' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
                Destination Warehouse
              </label>
              <select
                value={destId}
                onChange={(e) => setDestId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} {w.is_cold_storage ? '❄️' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-slate-400 block mb-1">
              Order Notes / Routing Justification
            </label>
            <input
              type="text"
              placeholder="e.g. Critical cold-chain rebalance for hospital pediatric unit"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2.5"
            />
          </div>

          {/* Add Line Items */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-mono uppercase text-slate-300 block mb-2 font-semibold">
              Add Batch Lots to Transfer
            </label>
            <div className="flex gap-2">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(Number(e.target.value))}
                className="flex-1 bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2"
              >
                {allBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.medicineName} [{b.batch_no}] (Exp: {b.exp_date}) {b.requiresColdChain ? '❄️' : ''}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={itemQty}
                onChange={(e) => setItemQty(Number(e.target.value))}
                className="w-24 bg-slate-950 border border-slate-700 text-white text-xs rounded-lg p-2 font-mono"
                placeholder="Qty"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
          </div>

          {/* Staged Items List */}
          <div className="max-h-44 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950 p-2 space-y-1.5">
            {items.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500">
                No lots staged. Select a batch above and click "Add Item".
              </div>
            ) : (
              items.map((item, idx) => {
                const b = allBatches.find((x) => x.id === item.batchId);
                return (
                  <div key={idx} className="flex items-center justify-between bg-slate-900/80 px-3 py-2 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">{b?.batch_no}</span>
                      <span className="text-slate-300">{b?.medicineName}</span>
                      {b?.requiresColdChain && <Snowflake className="h-3 w-3 text-cyan-400 inline" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white font-bold">{item.quantity} units</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Creating Order...' : 'Create Draft Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
