import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PieChart,
  Calendar,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const ReportsAnalytics: React.FC = () => {
  const { clients, invoices, companies, users, stages, serviceCategories } = useCRM();

  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  // Key aggregations
  const totalRevenue = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + i.balanceAmount, 0);
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.grandTotal, 0);

  // Revenue by month mock trend
  const monthlyRevenue = [
    { month: 'Oct', amount: 52000 },
    { month: 'Nov', amount: 68000 },
    { month: 'Dec', amount: 79000 },
    { month: 'Jan', amount: 94000 },
    { month: 'Feb', amount: 112000 },
    { month: 'Mar', amount: 135000 },
  ];

  const maxMonthRev = Math.max(...monthlyRevenue.map((m) => m.amount));

  // Service distribution
  const serviceStats = (serviceCategories || []).map((cat) => {
    if (!cat) return { name: '', count: 0, revenue: 0 };
    const matchingCount = (clients || []).reduce(
      (acc, c) => acc + (c?.services || []).filter((s) => s && s.serviceId === cat.id).length,
      0
    );
    return {
      name: cat.name,
      count: matchingCount,
      revenue: matchingCount * (cat.defaultPrice || 0),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Reports & Financial Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational KPIs, branch revenues, service volumes, and PRO productivity scorecards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === 'month' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === 'quarter' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              This Quarter
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                timeRange === 'year' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Year-to-Date
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Billed Volume</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            AED {totalInvoiced.toLocaleString()}
          </div>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% growth
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Collected Revenue</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">AED {totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">
            Collection rate: {Math.round((totalRevenue / (totalInvoiced || 1)) * 100)}%
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Pending Receivables</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            AED {totalOutstanding.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across active client invoices</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Average Case Completion</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">4.2 Days</div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">18% faster than SLA</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Graph */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue Growth Trend (AED)</h3>
              <p className="text-xs text-slate-500">Monthly billing and collections progression</p>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-8 pb-2 px-4 border-b border-slate-100 dark:border-slate-800">
            {monthlyRevenue.map((item, idx) => {
              const heightPercent = Math.round((item.amount / maxMonthRev) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    AED {(item.amount / 1000).toFixed(0)}k
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-xl h-full flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all rounded-t-xl"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Volume Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Service Popularity</h3>
          <div className="space-y-3">
            {serviceStats.map((srv, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    {srv.name}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{srv.count} cases</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, srv.count * 20))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRO Officer Productivity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">PRO Staff Productivity Scorecard</h3>
          <p className="text-xs text-slate-500">Performance rankings based on completed visa milestones and SLA compliance</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Assigned Clients</th>
                <th className="py-3 px-4">Completed Applications</th>
                <th className="py-3 px-4">Average Turnaround</th>
                <th className="py-3 px-4 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {(users || [])
                .filter((u) => u && u.role === 'employee')
                .map((emp) => {
                  const empClients = (clients || []).filter((c) =>
                    c && (c.assignedEmployeeIds || (c.assignedEmployeeId ? [c.assignedEmployeeId] : [])).includes(emp.id)
                  );
                  const comp = (companies || []).find((c) => c && c.id === emp.companyId);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{emp.name}</span>
                            <p className="text-[11px] text-slate-500">{emp.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{comp?.name || 'Headquarters'}</td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">{empClients.length}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">{empClients.length + 8}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">3.8 Days</td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-500">⭐ 4.9 / 5.0</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
