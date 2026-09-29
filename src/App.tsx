import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExpiryDashboard } from './components/ExpiryDashboard';
import { FEFODispenser } from './components/FEFODispenser';
import { TransferWorkflow } from './components/TransferWorkflow';
import { MedicineCatalog } from './components/MedicineCatalog';
import { AnalyticsBI } from './components/AnalyticsBI';
import { RBACManager } from './components/RBACManager';
import { User, UserRole } from './types';
import { fetchCurrentUser, switchDemoRole, fetchExpiryDashboard } from './api/client';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

function ERPContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('expiry');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [targetDispenseMedId, setTargetDispenseMedId] = useState<number | undefined>(undefined);
  const [criticalCount, setCriticalCount] = useState<number>(0);

  useEffect(() => {
    fetchCurrentUser()
      .then((u) => setCurrentUser(u))
      .catch((err) => console.error('Error fetching user:', err));

    fetchExpiryDashboard()
      .then((data) => {
        setCriticalCount(data?.summary?.critical_batch_count || 0);
      })
      .catch((err) => console.error('Error fetching dashboard summary:', err));
  }, []);

  const handleRoleChange = async (role: UserRole) => {
    try {
      const res = await switchDemoRole(role);
      setCurrentUser(res.user);
    } catch (err) {
      console.error('Error switching role:', err);
    }
  };

  const handleSelectMedForDispense = (medId: number) => {
    setTargetDispenseMedId(medId);
    setActiveTab('fefo');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        criticalExpiryCount={criticalCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'expiry' && (
          <ExpiryDashboard onDispenseSelect={handleSelectMedForDispense} />
        )}
        {activeTab === 'fefo' && (
          <FEFODispenser initialMedicineId={targetDispenseMedId} />
        )}
        {activeTab === 'transfers' && (
          <TransferWorkflow currentUser={currentUser} />
        )}
        {activeTab === 'catalog' && (
          <MedicineCatalog />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsBI />
        )}
        {activeTab === 'rbac' && (
          <RBACManager currentUser={currentUser} onRoleChange={handleRoleChange} />
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">{t.footerCopyright}</span>
            <span>·</span>
            <span>{t.footerCompliance}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-cyan-400">{t.footerBackend}</span>
            <span>·</span>
            <span className="text-emerald-400">{t.footerEngine}</span>
            <span>·</span>
            <span className="text-slate-400">Branch: main</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <ERPContent />
    </LanguageProvider>
  );
}

export default App;
