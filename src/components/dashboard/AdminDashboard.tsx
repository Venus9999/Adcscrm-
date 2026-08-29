import React from 'react';
import {
  Users,
  Briefcase,
  DollarSign,
  Clock,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Layers,
  Globe,
  Plane,
  ArrowUpRight,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    companies,
    filteredClients,
    filteredInvoices,
    filteredTasks,
    users,
    expiringDocuments,
    visaApplications,
    setActiveTab,
    setSelectedClientId,
  } = useCRM();

  const myCompany = companies.find((c) => c.id === currentUser.companyId) || companies[0];

  const totalClients = filteredClients.length;
  const activeCases = filteredClients.reduce(
    (acc, c) => acc + c.services.filter((s) => s.status === 'active').length,
    0
  );
  const totalRevenue = filteredInvoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const outstandingAmount = filteredInvoices.reduce((acc, i) => acc + i.balanceAmount, 0);

  const branchEmployees = users.filter((u) => u.companyId === myCompany.id && u.role === 'employee');

  return (
    <div className="space-y-6">
      {/* 4-Column Geometric Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Branch Clients
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalClients}
            </span>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded">
              {activeCases} Active
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Branch Revenue (MTD)
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              AED {(totalRevenue / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-green-600 font-bold bg-green-50 dark:bg-green-950/50 px-2 py-1 rounded">
              Collected
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Outstanding Invoices
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-amber-600">
              AED {outstandingAmount.toLocaleString()}
            </span>
            <span className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded">
              To Collect
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
            Assigned PRO Officers
          </p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {branchEmployees.length}
            </span>
            <span className="text-xs text-slate-600 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              On Duty
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
                190+ Destinations
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit global client applications, track embassy submission stages, biometric appointments, and client fees.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('visa')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Visa Services ({visaApplications.length} Cases)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: 8 Cols Left + 4 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Branch Cases Table & Employee Productivity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Clients Queue Table */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-widest">
                  Branch Client Queue
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('clients')}
                className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Full List</span>
                <span>→</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredClients.slice(0, 5).map((client) => (
                    <tr
                      key={client.id}
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setActiveTab('clients');
                      }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{client.fullName}</p>
                        <p className="text-[11px] font-mono text-slate-400">{client.refNo || client.passportNumber}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {client.services[0]?.serviceName || 'Standard Processing'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase">
                          {client.currentStageName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-blue-600 text-xs font-bold hover:underline">Review →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assigned PRO Officers */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-widest mb-4">
              PRO Staff Workload Allocation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branchEmployees.map((emp) => {
                const empClients = filteredClients.filter((c) => c.assignedEmployeeIds.includes(emp.id));
                const empTasks = filteredTasks.filter((t) => t.assignedEmployeeId === emp.id);

                return (
                  <div
                    key={emp.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img src={emp.avatar} alt="" className="w-8 h-8 rounded-md object-cover" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{emp.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{emp.title}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-blue-600">{empClients.length} dossiers</p>
                      <p className="text-[10px] text-slate-400">{empTasks.length} tasks</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Branch Info & Urgent Tasks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Deep Slate Branch Profile Card */}
          <div className="bg-slate-900 text-white rounded-lg p-5 shadow-lg relative overflow-hidden">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
              Branch Entity Profile
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Company Name</span>
                <span className="font-bold">{myCompany.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Trade License</span>
                <span className="font-mono">{myCompany.tradeLicenseNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">TRN Number</span>
                <span className="font-mono">{myCompany.trn}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Expiry Date</span>
                <span className="font-semibold text-emerald-400">{myCompany.licenseExpiryDate}</span>
              </div>
            </div>
          </div>

          {/* Urgent Priority Tasks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Tasks Needing Action
            </h4>
            <div className="space-y-2">
              {filteredTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveTab('tasks')}
                  className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-500 transition-all cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>Due: {task.dueDate}</span>
                    <span className="uppercase font-bold text-blue-600">{task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
