import React from 'react';
import { Pill, Shield, ArrowLeftRight, Activity, BarChart3, Clock, Warehouse as WarehouseIcon, UserCheck, AlertTriangle } from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onRoleChange: (role: UserRole) => void;
  criticalExpiryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onRoleChange,
  criticalExpiryCount,
}) => {
  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'SuperAdmin', title: 'Super Admin', desc: 'Full System & Security Access' },
    { role: 'Pharmacist', title: 'Lead Pharmacist', desc: 'Approves Transfers & Dispenses' },
    { role: 'Warehouse_Staff', title: 'Warehouse Staff', desc: 'Dispatches & Reconciles' },
    { role: 'Sales_Rep', title: 'Sales Rep', desc: 'Catalog & Stock Visibility Only' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-lg">PharmaTrack</span>
                <span className="text-xs uppercase px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  ERP v1.4
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live FEFO Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Batch-Tracked Supply Chain & Distribution</p>
            </div>
          </div>

          {/* User Role Switcher (RBAC Persona Controller) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5 px-3">
              <Shield className="h-4 w-4 text-cyan-400" />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Simulate RBAC Role:</span>
                <select
                  value={currentUser?.role || 'SuperAdmin'}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.role} value={r.role} className="bg-slate-900 text-white">
                      {r.title} ({r.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentUser && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-slate-200">{currentUser.full_name}</span>
                <span className="text-[11px] text-slate-400">{currentUser.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none">
          <button
            onClick={() => setActiveTab('expiry')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'expiry'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Expiry Dashboard
            {criticalExpiryCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                {criticalExpiryCount} Critical
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fefo')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'fefo'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            FEFO Dispensing Engine
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'transfers'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            Inter-Warehouse Transfers
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Pill className="h-3.5 w-3.5" />
            Medicines & Batches
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            BI & Financial Analytics
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'rbac'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            RBAC & Security
          </button>
        </nav>
      </div>
    </header>
  );
};
