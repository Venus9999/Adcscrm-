import React from 'react';
import {
  Users,
  Building2,
  Briefcase,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  Globe,
  Plane,
  Wand2,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const MasterDashboard: React.FC = () => {
  const {
    companies,
    clients,
    invoices,
    tasks,
    stages,
    expiringDocuments,
    visaApplications,
    setActiveTab,
    setSelectedCompanyId,
    setSelectedClientId,
  } = useCRM();

  // Metrics
  const totalClients = (clients || []).length;
  const activeServices = (clients || []).reduce((acc, c) => acc + ((c?.services || []).filter((s) => s?.status === 'active').length), 0);
  const totalRevenue = (invoices || []).reduce((acc, i) => acc + (i?.amountPaid || 0), 0);
  const totalOutstanding = (invoices || []).reduce((acc, i) => acc + (i?.balanceAmount || 0), 0);
  const pendingTasks = (tasks || []).filter((t) => t && t.status !== 'completed' && t.status !== 'cancelled').length;
  const urgentExpiries = (expiringDocuments || []).filter((e) => e && e.isUrgent).length;

  return (
    <div className="space-y-6">
      {/* 4-Column Geometric Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Clients */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Active Clients
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalClients.toLocaleString()}
            </span>
            <span className="text-xs text-green-600 font-bold bg-green-50 dark:bg-green-950/50 px-2 py-1 rounded">
              +12.5% MTD
            </span>
          </div>
        </div>

        {/* Processing Visas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Processing Visas & Cases
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeServices}
            </span>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded">
              {pendingTasks} Tasks Pending
            </span>
          </div>
        </div>

        {/* Collected Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Revenue (MTD)
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              AED {(totalRevenue / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              AED {totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Overdue / Urgent Action */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Action Required Expiries
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-red-500">
              {urgentExpiries}
            </span>
            <span className="text-xs text-red-600 font-bold bg-red-50 dark:bg-red-950/50 px-2 py-1 rounded">
              {expiringDocuments.length} in 180d
            </span>
          </div>
        </div>
      </div>

      {/* Worldwide Visas & Consular Operations Callout Banner */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-5 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold tracking-tight">Worldwide Visa & Consular Services Hub</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                190+ Countries
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Manage client applications, consular embassy filing milestones, VFS biometrics, and fee billing across Schengen, UK, US, GCC, and more.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('photo_studio')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Photo Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_advisor')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Visa Intel</span>
          </button>
          <button
            onClick={() => setActiveTab('visa')}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Visa Hub ({visaApplications.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: 8 Cols Table + 4 Cols Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Recent Processing Pipeline */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-widest">
                Recent Processing Pipeline
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View All 16 Stages</span>
              <span>→</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Client ID</th>
                  <th className="px-5 py-3">Name / Service</th>
                  <th className="px-5 py-3">Work Stage</th>
                  <th className="px-5 py-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                {(clients || []).slice(0, 5).map((client) => {
                  const stageObj = (stages || []).find((s) => s.id === client.currentStageId) || stages?.[0] || { stepNumber: 1, name: 'Processing', badgeBg: 'bg-blue-100 text-blue-800' };
                  const primaryService = client?.services?.[0]?.serviceName || 'Residency Visa Application';

                  return (
                    <tr
                      key={client.id}
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setActiveTab('clients');
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {client.fileNumber || `#C-${client.id.slice(-4)}`}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{client.fullName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{primaryService}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${stageObj.badgeBg}`}>
                          {stageObj.stepNumber}. {stageObj.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-slate-400 text-xs font-mono">
                        {client.updatedAt ? new Date(client.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Showing top active client dossiers</span>
            <button
              onClick={() => setActiveTab('clients')}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Open Full Directory ({totalClients} Records)
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Employee Utilization & System Quick-Switch */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Deep Slate Dark Accent Card */}
          <div className="bg-slate-900 text-white rounded-lg p-5 shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-600 rounded-full opacity-20 blur-2xl pointer-events-none"></div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Branch & Workload Utilization
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Dubai Main HQ</span>
                  <span className="font-bold">84%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Abu Dhabi Operations</span>
                  <span className="font-bold">62%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>PRO & Clearance Team</span>
                  <span className="font-bold">91%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">
                Active System Alerts
              </p>
              <ul className="text-xs space-y-2">
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
                  <span>{urgentExpiries} Trade Licenses / Visas expiring &lt; 30 days</span>
                </li>
                <li className="flex items-center gap-2 text-slate-300">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></span>
                  <span>{invoices.filter((i) => i.balanceAmount > 0).length} client invoices pending settlement</span>
                </li>
              </ul>
            </div>
          </div>

          {/* System Quick-Switch Branch Tiles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              System Quick-Switch
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {companies.map((comp) => {
                const compClients = clients.filter((c) => c.companyId === comp.id);
                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompanyId(comp.id);
                      setActiveTab('clients');
                    }}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-md text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all"
                  >
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{comp.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{compClients.length} Clients</p>
                  </div>
                );
              })}
              <div
                onClick={() => setActiveTab('companies')}
                className="p-2.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-md text-center flex items-center justify-center cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <span className="text-xs font-bold text-slate-500">+ Branch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
