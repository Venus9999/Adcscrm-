import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  LayoutGrid,
  List,
  AlertTriangle,
  ChevronRight,
  Eye,
  Building2,
  Calendar,
  FileCheck2,
  DollarSign,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Client } from '../../types/crm';

interface ClientsListProps {
  onOpenAddClient: () => void;
  onOpenClientDetail: (id: string) => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({ onOpenAddClient, onOpenClientDetail }) => {
  const { filteredClients, companies, stages, users, selectedCompanyId, selectedEmployeeId, bulkAssignClients, currentUser } = useCRM();

  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [bulkAssignEmployeeId, setBulkAssignEmployeeId] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [nationalityFilter, setNationalityFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState(selectedCompanyId || 'all');
  const [employeeFilter, setEmployeeFilter] = useState(selectedEmployeeId || 'all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const activeEmployees = useMemo(() => {
    return (users || []).filter((u) => u && (u.role === 'employee' || u.role === 'admin' || u.role === 'master'));
  }, [users]);

  useEffect(() => {
    if (selectedCompanyId) setCompanyFilter(selectedCompanyId);
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedEmployeeId) setEmployeeFilter(selectedEmployeeId);
  }, [selectedEmployeeId]);

  // Nationalities list
  const nationalities = useMemo(() => {
    const set = new Set<string>();
    (filteredClients || []).forEach((c) => {
      if (c && c.nationality) set.add(c.nationality);
    });
    return Array.from(set);
  }, [filteredClients]);

  // Company map for search matching
  const companyMap = useMemo(() => {
    const map = new Map<string, string>();
    (companies || []).forEach((c) => {
      if (c && c.id && c.name) map.set(c.id, c.name);
    });
    return map;
  }, [companies]);

  // User map for search matching
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    (users || []).forEach((u) => {
      if (u && u.id && u.name) map.set(u.id, u.name);
    });
    return map;
  }, [users]);

  // Filter clients
  const displayClients = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (filteredClients || []).filter((client) => {
      if (!client) return false;
      const compName = (client.companyId ? companyMap.get(client.companyId) || '' : '').toLowerCase();
      const assignedNames = (client.assignedEmployeeIds || [])
        .map((empId) => (userMap.get(empId) || '').toLowerCase())
        .join(' ');
      const adminName = (client.assignedAdminId ? userMap.get(client.assignedAdminId) || '' : '').toLowerCase();
      const serviceNames = (client.services || []).map((s) => (s?.serviceName || '').toLowerCase()).join(' ');
      const tags = (client.tags || []).join(' ').toLowerCase();

      // Search
      const matchSearch =
        !q ||
        (client.fullName && client.fullName.toLowerCase().includes(q)) ||
        (client.refNo && client.refNo.toLowerCase().includes(q)) ||
        (client.passportNo && client.passportNo.toLowerCase().includes(q)) ||
        client.emiratesId.toLowerCase().includes(q) ||
        client.mobile.includes(q) ||
        client.email.toLowerCase().includes(q) ||
        compName.includes(q) ||
        assignedNames.includes(q) ||
        adminName.includes(q) ||
        serviceNames.includes(q) ||
        tags.includes(q);

      // Stage
      const matchStage = stageFilter === 'all' || client.currentStageId === stageFilter;

      // Payment
      const matchPayment = paymentFilter === 'all' || client.paymentStatus === paymentFilter;

      // Nationality
      const matchNat = nationalityFilter === 'all' || client.nationality === nationalityFilter;

      // Company / Branch
      const matchComp = companyFilter === 'all' || client.companyId === companyFilter;

      // Employee
      const matchEmp =
        employeeFilter === 'all' ||
        client.assignedEmployeeIds?.includes(employeeFilter) ||
        client.assignedAdminId === employeeFilter;

      return matchSearch && matchStage && matchPayment && matchNat && matchComp && matchEmp;
    });
  }, [filteredClients, searchQuery, stageFilter, paymentFilter, nationalityFilter, companyFilter, employeeFilter, companyMap, userMap]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Ref Number',
      'Full Name',
      'Nationality',
      'Passport Number',
      'Passport Expiry',
      'Emirates ID',
      'Mobile',
      'Email',
      'Current Stage',
      'Payment Status',
      'Total Amount (AED)',
      'Paid Amount (AED)',
      'Outstanding (AED)',
    ];

    const rows = displayClients.map((c) => [
      c.refNo,
      `"${c.fullName}"`,
      `"${c.nationality}"`,
      c.passportNo,
      c.passportExpiry,
      c.emiratesId,
      c.mobile,
      c.email,
      `"${c.currentStageName}"`,
      c.paymentStatus,
      c.totalAmount,
      c.paidAmount,
      c.outstandingAmount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Clients & Dossier Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized database of individuals, corporate applicants, and residency cases
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddClient}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Client</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, employee, branch, passport, EID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-xs border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Branch / Company */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-xs border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="all">All Branches</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Employee / Agent Filter (Visible to Master and Admin only) */}
          {(currentUser.role === 'master' || currentUser.role === 'admin') && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className={`px-3 py-2 rounded-md text-xs border font-medium max-w-[160px] ${
                employeeFilter !== 'all'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <option value="all">All Employees</option>
              {(users || [])
                .filter((u) => u && u.role !== 'client')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
            </select>
          )}

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-xs border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="all">All Work Stages</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.stepNumber}. {s.name}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-xs border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>

          <select
            value={nationalityFilter}
            onChange={(e) => setNationalityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-xs border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="all">All Nationalities</option>
            {nationalities.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-md border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Client Assignment Toolbar */}
      {selectedClientIds.length > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-xs">
              {selectedClientIds.length} Selected
            </span>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">
              Bulk assign selected clients to employee / PRO:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bulkAssignEmployeeId}
              onChange={(e) => setBulkAssignEmployeeId(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="">Select Employee / Staff...</option>
              {activeEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.title || emp.role})
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!bulkAssignEmployeeId}
              onClick={() => {
                if (bulkAssignEmployeeId && selectedClientIds.length > 0) {
                  bulkAssignClients(selectedClientIds, [bulkAssignEmployeeId]);
                  setSelectedClientIds([]);
                  setBulkAssignEmployeeId('');
                }
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Assign to Staff
            </button>

            <button
              type="button"
              onClick={() => setSelectedClientIds([])}
              className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clients Display: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={displayClients.length > 0 && selectedClientIds.length === displayClients.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClientIds(displayClients.map((c) => c.id));
                        } else {
                          setSelectedClientIds([]);
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-5">Client / Reference</th>
                  <th className="py-3 px-5">Nationality & IDs</th>
                  <th className="py-3 px-5">Active Service</th>
                  <th className="py-3 px-5">Current Work Stage</th>
                  <th className="py-3 px-5">Payment Balance</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {displayClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No clients found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  displayClients.map((client) => {
                    const activeSrv = client.services?.[0];
                    const isSelected = selectedClientIds.includes(client.id);

                    return (
                      <tr
                        key={client.id}
                        onClick={() => onOpenClientDetail(client.id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group ${
                          isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td
                          className="py-3.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClientIds((prev) => [...prev, client.id]);
                              } else {
                                setSelectedClientIds((prev) => prev.filter((id) => id !== client.id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <img
                              src={client.avatar}
                              alt=""
                              className="w-9 h-9 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{client.fullName}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  {client.refNo}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">{client.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{client.nationality}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Pass: {client.passportNo}
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="text-slate-900 dark:text-white font-bold truncate max-w-[200px]">
                            {activeSrv?.serviceName || 'No service registered'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            PRO: {activeSrv?.assignedEmployeeName || 'Unassigned'}
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {client.currentStageName}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            AED {client.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-[11px] mt-0.5">
                            {client.outstandingAmount > 0 ? (
                              <span className="text-amber-600 font-bold">
                                Bal: AED {client.outstandingAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold">Paid in Full</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenClientDetail(client.id);
                            }}
                            className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Open Dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid Mode */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayClients.map((client) => {
            const activeSrv = client.services?.[0];
            return (
              <div
                key={client.id}
                onClick={() => onOpenClientDetail(client.id)}
                className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={client.avatar} alt="" className="w-11 h-11 rounded-md object-cover shrink-0" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{client.fullName}</h3>
                        <p className="text-xs text-slate-500">{client.nationality}</p>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mt-1 inline-block">
                          {client.refNo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Service:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                        {activeSrv?.serviceName || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Work Stage:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 uppercase text-[10px]">
                        {client.currentStageName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Passport:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{client.passportNo}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Outstanding</span>
                    <span
                      className={`font-bold ${
                        client.outstandingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      AED {client.outstandingAmount.toLocaleString()}
                    </span>
                  </div>
                  <button className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold rounded-md hover:bg-blue-100 text-xs flex items-center gap-1 cursor-pointer">
                    <span>View Dossier</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
