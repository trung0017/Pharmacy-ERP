import React from 'react';
import { Shield, Key, Check, X, UserCheck, Lock, Users, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../types';

interface RBACManagerProps {
  currentUser: User | null;
  onRoleChange: (role: UserRole) => void;
}

export const RBACManager: React.FC<RBACManagerProps> = ({ currentUser, onRoleChange }) => {
  const permissions = [
    {
      feature: 'View Expiry Radar & Stock Batches',
      SuperAdmin: true,
      Pharmacist: true,
      Warehouse_Staff: true,
      Sales_Rep: true,
    },
    {
      feature: 'Run FEFO Dispensing Engine & Print Pick Ticket',
      SuperAdmin: true,
      Pharmacist: true,
      Warehouse_Staff: true,
      Sales_Rep: false,
    },
    {
      feature: 'Create Draft Inter-Warehouse Transfer Order',
      SuperAdmin: true,
      Pharmacist: true,
      Warehouse_Staff: true,
      Sales_Rep: false,
    },
    {
      feature: 'Approve & Authorize Transfer Orders (Dispatched)',
      SuperAdmin: true,
      Pharmacist: true,
      Warehouse_Staff: false,
      Sales_Rep: false,
    },
    {
      feature: 'Receive & Reconcile Inbound Warehouse Stock',
      SuperAdmin: true,
      Pharmacist: false,
      Warehouse_Staff: true,
      Sales_Rep: false,
    },
    {
      feature: 'Executive BI Analytics & Cost/Margin Reports',
      SuperAdmin: true,
      Pharmacist: true,
      Warehouse_Staff: false,
      Sales_Rep: false,
    },
    {
      feature: 'User Management & Security Token Issuance',
      SuperAdmin: true,
      Pharmacist: false,
      Warehouse_Staff: false,
      Sales_Rep: false,
    },
  ];

  const roleProfiles: { role: UserRole; title: string; email: string; desc: string }[] = [
    {
      role: 'SuperAdmin',
      title: 'Dr. Sarah Vance, PharmD',
      email: 'admin@pharmatrack.io',
      desc: 'System Architect & Chief Medical Officer. Unrestricted enterprise oversight.',
    },
    {
      role: 'Pharmacist',
      title: 'Marcus Aurelius Chen, RPh',
      email: 'pharmacist@pharmatrack.io',
      desc: 'Formulary Director. Authorizes scheduled medicines, FEFO dispensing, and transfers.',
    },
    {
      role: 'Warehouse_Staff',
      title: 'Elena Rostova',
      email: 'warehouse@pharmatrack.io',
      desc: 'Logistics Supervisor. Physical stock fulfillment, barcoding, and receiving.',
    },
    {
      role: 'Sales_Rep',
      title: "David K. O'Connor",
      email: 'sales@pharmatrack.io',
      desc: 'Territory Accounts. Read-only inventory and formulary checking for client quotes.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Role-Based Access Control (RBAC) & Security Policy</span>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            Milestone 4: Security Matrix
          </span>
        </h1>
        <p className="text-sm text-slate-400">
          Cryptographically signed JWT tokens with route guard policies enforced across UI components and FastAPI REST routers.
        </p>
      </div>

      {/* Active Role Card & Interactive Persona Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roleProfiles.map((p) => {
          const isActive = currentUser?.role === p.role;
          return (
            <div
              key={p.role}
              onClick={() => onRoleChange(p.role)}
              className={`cursor-pointer rounded-xl p-4 transition border ${
                isActive
                  ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500 shadow-lg shadow-cyan-950'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase text-cyan-400">
                  {p.role}
                </span>
                {isActive ? (
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                )}
              </div>
              <h3 className="text-sm font-bold text-white">{p.title}</h3>
              <p className="text-xs font-mono text-slate-400">{p.email}</p>
              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{p.desc}</p>
              <button
                className={`mt-3 w-full py-1 text-xs rounded font-medium transition ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isActive ? 'Active Session' : 'Switch to Persona'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Permission Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              System Permissions & Route Guard Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Granular capabilities per authorized role in accordance with 21 CFR Part 11 requirements
            </p>
          </div>
          <Shield className="h-5 w-5 text-cyan-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Action / Feature Route</th>
                <th className="py-3 px-4 text-center">SuperAdmin</th>
                <th className="py-3 px-4 text-center">Pharmacist</th>
                <th className="py-3 px-4 text-center">Warehouse_Staff</th>
                <th className="py-3 px-4 text-center">Sales_Rep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-sans text-slate-200">{p.feature}</td>
                  <td className="py-3 px-4 text-center">
                    {p.SuperAdmin ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.Pharmacist ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.Warehouse_Staff ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.Sales_Rep ? (
                      <Check className="h-4 w-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
