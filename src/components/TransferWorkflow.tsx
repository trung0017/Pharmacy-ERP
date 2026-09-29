import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, CheckCircle2, Clock, Send, CheckCheck, XCircle, Plus, FileText, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { TransferOrder, Warehouse, Medicine, User } from '../types';
import { fetchTransferOrders, transitionTransferOrder, fetchWarehouses, fetchMedicines } from '../api/client';
import { CreateTransferModal } from './CreateTransferModal';

interface TransferWorkflowProps {
  currentUser: User | null;
}

export const TransferWorkflow: React.FC<TransferWorkflowProps> = ({ currentUser }) => {
  const [orders, setOrders] = useState<TransferOrder[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [transitioningId, setTransitioningId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordList, whList, medList] = await Promise.all([
        fetchTransferOrders(),
        fetchWarehouses(),
        fetchMedicines(),
      ]);
      setOrders(ordList);
      setWarehouses(whList);
      setMedicines(medList);
    } catch (err) {
      console.error('Error fetching transfer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransition = async (orderId: number, targetStatus: string) => {
    try {
      setTransitioningId(orderId);
      await transitionTransferOrder(orderId, targetStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Transition failed');
    } finally {
      setTransitioningId(null);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const role = currentUser?.role || 'SuperAdmin';
  const canApprove = role === 'SuperAdmin' || role === 'Pharmacist';
  const canReceive = role === 'SuperAdmin' || role === 'Warehouse_Staff';

  const pipelineStages = [
    { key: 'Draft', label: '1. Draft', desc: 'Staged by dispensary' },
    { key: 'Pending Approval', label: '2. Pending Approval', desc: 'Pharmacist verification' },
    { key: 'Dispatched', label: '3. Dispatched', desc: 'In-transit with cold-chain lock' },
    { key: 'Received & Reconciled', label: '4. Reconciled', desc: 'Restocked at destination' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & New Order Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Inter-Warehouse Transfer Workflow</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              Milestone 3: State Machine
            </span>
          </h1>
          <p className="text-sm text-slate-400">
            Governed transfer chain: <code className="text-cyan-300">Draft → Pending Approval → Dispatched → Received & Reconciled</code>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-cyan-950 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Transfer Order</span>
        </button>
      </div>

      {/* State Machine Overview Banner */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center justify-between">
          <span>Supply Chain Lifecycle Progression</span>
          <span className="text-[11px] text-cyan-400">RBAC Enforced Transitions</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.key}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition ${
                filterStatus === stage.key
                  ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold font-mono text-white">{stage.label}</span>
                <span className="h-5 w-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                  {orders.filter((o) => o.status === stage.key).length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{stage.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3 py-1.5 rounded-md font-medium transition ${
            filterStatus === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {pipelineStages.map((s) => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
              filterStatus === s.key
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.key} ({orders.filter((o) => o.status === s.key).length})
          </button>
        ))}
      </div>

      {/* Transfer Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-slate-800 bg-slate-900/30 text-slate-500 text-xs">
            No transfer orders found in "{filterStatus}" status.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isDispatched = order.status === 'Dispatched';
            const isPending = order.status === 'Pending Approval';
            const isDraft = order.status === 'Draft';
            const isReconciled = order.status === 'Received & Reconciled';
            const isCancelled = order.status === 'Cancelled';

            return (
              <div
                key={order.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4"
              >
                {/* Header row: Order No, Facilities, and State Badge */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-cyan-400">
                      {order.order_no}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                        isDraft
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : isPending
                          ? 'bg-amber-950/60 text-amber-300 border-amber-600 animate-pulse'
                          : isDispatched
                          ? 'bg-blue-950/60 text-blue-300 border-blue-500'
                          : isReconciled
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                          : 'bg-rose-950/60 text-rose-300 border-rose-600'
                      }`}
                    >
                      {order.status}
                    </span>

                    <span className="text-xs text-slate-500 font-mono">
                      Created: {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Route: Origin -> Destination */}
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {order.source_warehouse_name}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-cyan-300">
                      {order.destination_warehouse_name}
                    </span>
                  </div>
                </div>

                {/* Items & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase block font-semibold">
                      Transferred Batches & Quantities:
                    </span>
                    <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-400 font-bold">{item.batch_no}</span>
                            <span className="text-slate-300">{item.medicine_name}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-400">
                              Req: <strong className="text-white">{item.quantity_requested}</strong>
                            </span>
                            {isDispatched && (
                              <span className="text-blue-400">
                                Ship: <strong>{item.quantity_shipped}</strong>
                              </span>
                            )}
                            {isReconciled && (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCheck className="h-3.5 w-3.5" />
                                Recv: <strong>{item.quantity_received}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 uppercase block font-semibold">
                      Audit Trail & Governance:
                    </span>
                    <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div>
                        Initiator: <span className="text-slate-200">{order.creator_name || 'Dr. Vance'}</span>
                      </div>
                      {order.approver_name && (
                        <div>
                          Approved By: <span className="text-cyan-300">{order.approver_name}</span>
                        </div>
                      )}
                      {order.notes && (
                        <div className="italic text-slate-400 border-t border-slate-900 pt-1">
                          "{order.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* State Machine Transition Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400 font-mono">
                    State Action Available for Role: <strong className="text-slate-200">{role}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1. Draft -> Pending Approval */}
                    {isDraft && (
                      <button
                        onClick={() => handleTransition(order.id, 'Pending Approval')}
                        disabled={transitioningId === order.id}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Submit for Approval</span>
                      </button>
                    )}

                    {/* 2. Pending Approval -> Dispatched (Pharmacist / SuperAdmin) */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleTransition(order.id, 'Draft')}
                          disabled={transitioningId === order.id}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition"
                        >
                          Revise / Back to Draft
                        </button>
                        <button
                          onClick={() => {
                            if (!canApprove) {
                              alert("Permission Denied: Only Pharmacist or SuperAdmin can approve and dispatch transfer orders.");
                              return;
                            }
                            handleTransition(order.id, 'Dispatched');
                          }}
                          disabled={transitioningId === order.id}
                          className={`px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-blue-950 ${
                            !canApprove ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Approve & Dispatch Order</span>
                        </button>
                      </>
                    )}

                    {/* 3. Dispatched -> Received & Reconciled (Warehouse_Staff / SuperAdmin) */}
                    {isDispatched && (
                      <button
                        onClick={() => {
                          if (!canReceive) {
                            alert("Permission Denied: Only Warehouse Staff or SuperAdmin can receive and reconcile stock.");
                            return;
                          }
                          handleTransition(order.id, 'Received & Reconciled');
                        }}
                        disabled={transitioningId === order.id}
                        className={`px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-md shadow-emerald-950 ${
                          !canReceive ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <CheckCheck className="h-4 w-4" />
                        <span>Receive & Reconcile Inbound Stock</span>
                      </button>
                    )}

                    {/* Cancellation option for non-final orders */}
                    {!isReconciled && !isCancelled && (
                      <button
                        onClick={() => handleTransition(order.id, 'Cancelled')}
                        disabled={transitioningId === order.id}
                        className="px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs rounded-lg transition"
                      >
                        Cancel Order
                      </button>
                    )}

                    {isReconciled && (
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Reconciliation Complete (Stock Transferred)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warehouses={warehouses}
        medicines={medicines}
        onSuccess={loadData}
      />
    </div>
  );
};
