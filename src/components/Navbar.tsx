import React from 'react';
import { Pill, Shield, ArrowLeftRight, Activity, BarChart3, Clock, Globe } from 'lucide-react';
import { User, UserRole } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { language, setLanguage, t } = useLanguage();

  const roles: { role: UserRole; title: string }[] = [
    { role: 'SuperAdmin', title: t.roleSuperAdmin },
    { role: 'Pharmacist', title: t.rolePharmacist },
    { role: 'Warehouse_Staff', title: t.roleWarehouseStaff },
    { role: 'Sales_Rep', title: t.roleSalesRep },
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
                <span className="font-bold tracking-tight text-white text-lg">{t.platformTitle}</span>
                <span className="text-xs uppercase px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {t.version}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {t.liveFefoEngine}
                </span>
              </div>
              <p className="text-xs text-slate-400">{t.platformSubtitle}</p>
            </div>
          </div>

          {/* Right Action Bar: Language Switcher + User Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setLanguage('vi')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
                  language === 'vi'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tiếng Việt"
              >
                <span>🇻🇳</span>
                <span className="hidden md:inline">Tiếng Việt</span>
                <span className="md:hidden">VI</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition ${
                  language === 'en'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="English"
              >
                <span>🇺🇸</span>
                <span className="hidden md:inline">English</span>
                <span className="md:hidden">EN</span>
              </button>
            </div>

            {/* User Role Switcher (RBAC Persona Controller) */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5 px-3">
              <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-400 hidden sm:block text-[10px] uppercase font-mono">{t.simulateRbacRole}</span>
                <select
                  value={currentUser?.role || 'SuperAdmin'}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r.role} value={r.role} className="bg-slate-900 text-white">
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentUser && (
              <div className="hidden lg:flex flex-col text-right">
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
            {t.tabExpiry}
            {criticalExpiryCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                {criticalExpiryCount} {t.critical}
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
            {t.tabFefo}
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
            {t.tabTransfers}
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
            {t.tabCatalog}
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
            {t.tabAnalytics}
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
            {t.tabRbac}
          </button>
        </nav>
      </div>
    </header>
  );
};
