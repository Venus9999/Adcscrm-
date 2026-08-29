import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  User,
  Users,
  FileText,
  DollarSign,
  CheckSquare,
  Building2,
  ArrowRight,
  Briefcase,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { UserRole } from '../../types/crm';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterEntityType = 'all' | 'clients' | 'leads' | 'employees' | 'documents' | 'invoices' | 'tasks' | 'companies' | 'vendors';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const {
    clients,
    leads,
    users,
    documents,
    invoices,
    tasks,
    companies,
    vendors,
    setSelectedClientId,
    setSelectedCompanyId,
    selectedCompanyId,
    selectedEmployeeId,
    setActiveTab,
  } = useCRM();

  const [query, setQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>(selectedCompanyId || 'all');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>(selectedEmployeeId || 'all');
  const [activeEntityType, setActiveEntityType] = useState<FilterEntityType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCompanyFilter(selectedCompanyId || 'all');
      setSelectedEmployeeFilter(selectedEmployeeId || 'all');
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveEntityType('all');
    }
  }, [isOpen, selectedCompanyId, selectedEmployeeId]);

  // Helper map for company names
  const companyMap = useMemo(() => {
    const map = new Map<string, string>();
    (companies || []).forEach((c) => {
      if (c && c.id && c.name) map.set(c.id, c.name);
    });
    return map;
  }, [companies]);

  // Helper map for user names
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    (users || []).forEach((u) => {
      if (u && u.id && u.name) map.set(u.id, u.name);
    });
    return map;
  }, [users]);

  const cleanQuery = (query || '').trim().toLowerCase();

  // Matched Clients
  const matchedClients = useMemo(() => {
    return (clients || []).filter((c) => {
      if (!c) return false;
      // Company filter
      if (selectedCompanyFilter !== 'all' && c.companyId !== selectedCompanyFilter) return false;

      // Employee filter
      if (
        selectedEmployeeFilter !== 'all' &&
        !c.assignedEmployeeIds?.includes(selectedEmployeeFilter) &&
        c.assignedAdminId !== selectedEmployeeFilter
      ) {
        return false;
      }

      if (!cleanQuery) return selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all';

      const compName = (c.companyId ? companyMap.get(c.companyId) || '' : '').toLowerCase();
      const assignedNames = (c.assignedEmployeeIds || [])
        .map((empId) => (userMap.get(empId) || '').toLowerCase())
        .join(' ');
      const adminName = (c.assignedAdminId ? userMap.get(c.assignedAdminId) || '' : '').toLowerCase();
      const serviceNames = (c.services || []).map((s) => (s?.serviceName || '').toLowerCase()).join(' ');
      const tags = (c.tags || []).join(' ').toLowerCase();

      return (
        (c.fullName && c.fullName.toLowerCase().includes(cleanQuery)) ||
        (c.refNo && c.refNo.toLowerCase().includes(cleanQuery)) ||
        (c.passportNo && c.passportNo.toLowerCase().includes(cleanQuery)) ||
        (c.emiratesId && c.emiratesId.toLowerCase().includes(cleanQuery)) ||
        (c.mobile && c.mobile.includes(cleanQuery)) ||
        (c.whatsapp && c.whatsapp.includes(cleanQuery)) ||
        (c.email && c.email.toLowerCase().includes(cleanQuery)) ||
        (c.nationality && c.nationality.toLowerCase().includes(cleanQuery)) ||
        (c.currentStageName && c.currentStageName.toLowerCase().includes(cleanQuery)) ||
        compName.includes(cleanQuery) ||
        assignedNames.includes(cleanQuery) ||
        adminName.includes(cleanQuery) ||
        serviceNames.includes(cleanQuery) ||
        tags.includes(cleanQuery)
      );
    });
  }, [clients, selectedCompanyFilter, selectedEmployeeFilter, cleanQuery, companyMap, userMap]);

  // Matched Leads
  const matchedLeads = useMemo(() => {
    return (leads || []).filter((l) => {
      if (!l) return false;
      // Company / Branch filter
      if (selectedCompanyFilter !== 'all' && l.companyId !== selectedCompanyFilter) return false;

      // Employee filter
      if (selectedEmployeeFilter !== 'all' && l.assignedEmployeeId !== selectedEmployeeFilter) return false;

      if (!cleanQuery) return selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all';

      const compName = (l.companyId ? companyMap.get(l.companyId) || l.branchName || '' : l.branchName || '').toLowerCase();
      const empName = (l.assignedEmployeeName || (l.assignedEmployeeId ? userMap.get(l.assignedEmployeeId) || '' : '')).toLowerCase();
      const tags = (l.tags || []).join(' ').toLowerCase();

      return (
        (l.name && l.name.toLowerCase().includes(cleanQuery)) ||
        (l.refNo && l.refNo.toLowerCase().includes(cleanQuery)) ||
        (l.companyName && l.companyName.toLowerCase().includes(cleanQuery)) ||
        (l.phone && l.phone.includes(cleanQuery)) ||
        (l.whatsapp && l.whatsapp.includes(cleanQuery)) ||
        (l.email && l.email.toLowerCase().includes(cleanQuery)) ||
        (l.serviceInterested && l.serviceInterested.toLowerCase().includes(cleanQuery)) ||
        (l.category && l.category.toLowerCase().includes(cleanQuery)) ||
        (l.jobType && l.jobType.toLowerCase().includes(cleanQuery)) ||
        (l.jobTitleInterest && l.jobTitleInterest.toLowerCase().includes(cleanQuery)) ||
        (l.country && l.country.toLowerCase().includes(cleanQuery)) ||
        (l.city && l.city.toLowerCase().includes(cleanQuery)) ||
        (l.currentLocation && l.currentLocation.toLowerCase().includes(cleanQuery)) ||
        (l.nationality && l.nationality.toLowerCase().includes(cleanQuery)) ||
        (l.status && l.status.toLowerCase().includes(cleanQuery)) ||
        compName.includes(cleanQuery) ||
        empName.includes(cleanQuery) ||
        tags.includes(cleanQuery)
      );
    });
  }, [leads, selectedCompanyFilter, selectedEmployeeFilter, cleanQuery, companyMap, userMap]);

  // Matched Employees / Users
  const matchedEmployees = useMemo(() => {
    return (users || []).filter((u) => {
      if (!u) return false;
      // Company filter
      if (selectedCompanyFilter !== 'all') {
        const isInCompany = u.companyId === selectedCompanyFilter || u.companyIds?.includes(selectedCompanyFilter);
        if (!isInCompany) return false;
      }

      // Employee filter
      if (selectedEmployeeFilter !== 'all' && u.id !== selectedEmployeeFilter) return false;

      if (!cleanQuery) return selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all';

      const compName = (u.companyId ? companyMap.get(u.companyId) || '' : '').toLowerCase();

      return (
        (u.name && u.name.toLowerCase().includes(cleanQuery)) ||
        (u.email && u.email.toLowerCase().includes(cleanQuery)) ||
        (u.phone && u.phone.includes(cleanQuery)) ||
        (u.role && u.role.toLowerCase().includes(cleanQuery)) ||
        (u.title && u.title.toLowerCase().includes(cleanQuery)) ||
        (u.jobTitle && u.jobTitle.toLowerCase().includes(cleanQuery)) ||
        (u.department && u.department.toLowerCase().includes(cleanQuery)) ||
        compName.includes(cleanQuery)
      );
    });
  }, [users, selectedCompanyFilter, selectedEmployeeFilter, cleanQuery, companyMap]);

  // Matched Documents
  const matchedDocs = useMemo(() => {
    return (documents || []).filter((d) => {
      if (!d) return false;
      // Check linked client's company or employee if client exists
      const linkedClient = (clients || []).find((c) => c && c.id === d.clientId);
      if (selectedCompanyFilter !== 'all' && linkedClient && linkedClient.companyId !== selectedCompanyFilter) {
        return false;
      }
      if (
        selectedEmployeeFilter !== 'all' &&
        linkedClient &&
        !linkedClient.assignedEmployeeIds?.includes(selectedEmployeeFilter) &&
        linkedClient.assignedAdminId !== selectedEmployeeFilter &&
        d.uploadedByUserId !== selectedEmployeeFilter
      ) {
        return false;
      }

      if (!cleanQuery) return selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all';

      const clientName = (d.clientName || linkedClient?.fullName || '').toLowerCase();
      const uploaderName = (d.uploadedByName || '').toLowerCase();

      return (
        (d.name && d.name.toLowerCase().includes(cleanQuery)) ||
        (d.category && d.category.toLowerCase().includes(cleanQuery)) ||
        clientName.includes(cleanQuery) ||
        uploaderName.includes(cleanQuery) ||
        (d.remarks && d.remarks.toLowerCase().includes(cleanQuery))
      );
    });
  }, [documents, clients, selectedCompanyFilter, selectedEmployeeFilter, cleanQuery]);

  // Matched Invoices
  const matchedInvoices = useMemo(() => {
    return (invoices || []).filter((i) => {
      if (!i) return false;
      // Check linked client's company
      const linkedClient = (clients || []).find((c) => c && c.id === i.clientId);
      if (selectedCompanyFilter !== 'all' && linkedClient && linkedClient.companyId !== selectedCompanyFilter) {
        return false;
      }
      if (
        selectedEmployeeFilter !== 'all' &&
        i.issuedByUserId !== selectedEmployeeFilter &&
        linkedClient &&
        !linkedClient.assignedEmployeeIds?.includes(selectedEmployeeFilter)
      ) {
        return false;
      }

      if (!cleanQuery) return selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all';

      const clientName = (i.clientName || linkedClient?.fullName || '').toLowerCase();
      const issuerName = (i.issuedByUserName || '').toLowerCase();

      return (
        (i.invoiceNumber && i.invoiceNumber.toLowerCase().includes(cleanQuery)) ||
        clientName.includes(cleanQuery) ||
        (i.receiptNumber && i.receiptNumber.toLowerCase().includes(cleanQuery)) ||
        issuerName.includes(cleanQuery) ||
        (i.status && i.status.toLowerCase().includes(cleanQuery))
      );
    });
  }, [invoices, clients, selectedCompanyFilter, selectedEmployeeFilter, cleanQuery]);

  // Matched Tasks
  const matchedTasks = useMemo(() => {
    return (tasks || []).filter((t) => {
      if (!t) return false;
      // Company filter
      if (selectedCompanyFilter !== 'all' && t.companyId && t.companyId !== selectedCompanyFilter) {
        return false;
      }

      // Employee filter
      if (selectedEmployeeFilter !== 'all' && t.assignedEmployeeId !== selectedEmployeeFilter) {
        return false;
      }

      if (!cleanQuery) return selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all';

      const empName = (t.assignedEmployeeName || (t.assignedEmployeeId ? userMap.get(t.assignedEmployeeId) || '' : '')).toLowerCase();
      const clientName = (t.clientName || '').toLowerCase();
      const leadName = (t.leadName || '').toLowerCase();

      return (
        (t.title && t.title.toLowerCase().includes(cleanQuery)) ||
        (t.description && t.description.toLowerCase().includes(cleanQuery)) ||
        clientName.includes(cleanQuery) ||
        leadName.includes(cleanQuery) ||
        empName.includes(cleanQuery) ||
        (t.status && t.status.toLowerCase().includes(cleanQuery)) ||
        (t.priority && t.priority.toLowerCase().includes(cleanQuery))
      );
    });
  }, [tasks, selectedCompanyFilter, selectedEmployeeFilter, cleanQuery, userMap]);

  // Matched Companies
  const matchedCompanies = useMemo(() => {
    return (companies || []).filter((c) => {
      if (!c) return false;
      if (selectedCompanyFilter !== 'all' && c.id !== selectedCompanyFilter) return false;
      if (
        selectedEmployeeFilter !== 'all' &&
        !c.employeeIds?.includes(selectedEmployeeFilter) &&
        c.adminId !== selectedEmployeeFilter &&
        !c.assignedAdminIds?.includes(selectedEmployeeFilter)
      ) {
        return false;
      }

      if (!cleanQuery) return selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all';

      return (
        (c.name && c.name.toLowerCase().includes(cleanQuery)) ||
        (c.tradeLicenseNo && c.tradeLicenseNo.toLowerCase().includes(cleanQuery)) ||
        (c.trn && c.trn.includes(cleanQuery)) ||
        (c.city && c.city.toLowerCase().includes(cleanQuery)) ||
        (c.address && c.address.toLowerCase().includes(cleanQuery)) ||
        (c.phone && c.phone.includes(cleanQuery)) ||
        (c.email && c.email.toLowerCase().includes(cleanQuery))
      );
    });
  }, [companies, selectedCompanyFilter, selectedEmployeeFilter, cleanQuery]);

  // Matched Vendors
  const matchedVendors = useMemo(() => {
    return (vendors || []).filter((v) => {
      if (!v) return false;
      if (selectedCompanyFilter !== 'all' && v.companyId && v.companyId !== selectedCompanyFilter) {
        return false;
      }

      if (!cleanQuery) return selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all';

      return (
        (v.name && v.name.toLowerCase().includes(cleanQuery)) ||
        (v.category && v.category.toLowerCase().includes(cleanQuery)) ||
        (v.contactPerson && v.contactPerson.toLowerCase().includes(cleanQuery)) ||
        (v.phone && v.phone.includes(cleanQuery)) ||
        (v.email && v.email.toLowerCase().includes(cleanQuery)) ||
        (v.companyName && v.companyName.toLowerCase().includes(cleanQuery))
      );
    });
  }, [vendors, selectedCompanyFilter, cleanQuery]);

  const totalResultsCount =
    matchedClients.length +
    matchedLeads.length +
    matchedEmployees.length +
    matchedDocs.length +
    matchedInvoices.length +
    matchedTasks.length +
    matchedCompanies.length +
    matchedVendors.length;

  const hasFilterActive = selectedCompanyFilter !== 'all' || selectedEmployeeFilter !== 'all' || activeEntityType !== 'all';

  const clearAllFilters = () => {
    setSelectedCompanyFilter('all');
    setSelectedEmployeeFilter('all');
    setActiveEntityType('all');
    setQuery('');
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'master':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'employee':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 md:pt-16 bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Main Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by client name, employee, branch/company, passport, ref#, invoice, lead..."
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-base font-medium focus:outline-hidden"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-slate-500 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Toolbar: Employee, Company/Branch, & Quick Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex flex-wrap items-center gap-2">
              {/* Company / Branch Selector */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Branch:</span>
                <select
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Companies & Branches</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.city ? `(${c.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee / Agent Selector */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Employee:</span>
                <select
                  value={selectedEmployeeFilter}
                  onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer max-w-[180px]"
                >
                  <option value="all">All Staff & Employees</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters Button */}
              {hasFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear Filters
                </button>
              )}
            </div>

            {/* Total Results Count */}
            <div className="text-xs text-slate-500 font-medium ml-auto flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {cleanQuery || hasFilterActive ? `${totalResultsCount} matching results` : 'Global CRM Search'}
              </span>
            </div>
          </div>

          {/* Entity Type Category Tabs */}
          {(cleanQuery || hasFilterActive) && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button
                onClick={() => setActiveEntityType('all')}
                className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeEntityType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                All Results ({totalResultsCount})
              </button>

              {matchedClients.length > 0 && (
                <button
                  onClick={() => setActiveEntityType('clients')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeEntityType === 'clients'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Clients ({matchedClients.length})
                </button>
              )}

              {matchedLeads.length > 0 && (
                <button
                  onClick={() => setActiveEntityType('leads')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeEntityType === 'leads'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Leads ({matchedLeads.length})
                </button>
              )}

              {matchedEmployees.length > 0 && (
                <button
                  onClick={() => setActiveEntityType('employees')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeEntityType === 'employees'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Staff ({matchedEmployees.length})
                </button>
              )}

              {matchedDocs.length > 0 && (
                <button
                  onClick={() => setActiveEntityType('documents')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeEntityType === 'documents'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Documents ({matchedDocs.length})
                </button>
              )}

              {matchedInvoices.length > 0 && (
                <button
                  onClick={() => setActiveEntityType('invoices')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeEntityType === 'invoices'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Invoices ({matchedInvoices.length})
                </button>
              )}

              {matchedTasks.length > 0 && (
                <button
                  onClick={() => setActiveEntityType('tasks')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeEntityType === 'tasks'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Tasks ({matchedTasks.length})
                </button>
              )}

              {matchedCompanies.length > 0 && (
                <button
                  onClick={() => setActiveEntityType('companies')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeEntityType === 'companies'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Companies ({matchedCompanies.length})
                </button>
              )}

              {matchedVendors.length > 0 && (
                <button
                  onClick={() => setActiveEntityType('vendors')}
                  className={`px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeEntityType === 'vendors'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Vendors ({matchedVendors.length})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Results Display Area */}
        <div className="overflow-y-auto p-4 space-y-6 divide-y divide-slate-100 dark:divide-slate-800/80">
          {!query && !hasFilterActive && (
            <div className="py-10 text-center text-slate-400 text-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Universal Enterprise Search & Filter
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Filter across all clients, leads, staff employees, branches, companies, invoices, and documents anywhere.
              </p>

              {/* Quick Search Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-lg mx-auto">
                <button
                  onClick={() => setQuery('Golden Visa')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs rounded-full text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  "Golden Visa"
                </button>
                <button
                  onClick={() => setQuery('Dubai')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs rounded-full text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  "Dubai HQ"
                </button>
                <button
                  onClick={() => setQuery('Marcus')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs rounded-full text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  "Marcus"
                </button>
                <button
                  onClick={() => setQuery('INV-')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs rounded-full text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  "INV-2026"
                </button>
                <button
                  onClick={() => setQuery('Lead')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs rounded-full text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  "Walk-in Leads"
                </button>
              </div>
            </div>
          )}

          {(query || hasFilterActive) && totalResultsCount === 0 && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                No matching records found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your search keywords, branch filter, or employee filter.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Section: Clients */}
          {matchedClients.length > 0 && (activeEntityType === 'all' || activeEntityType === 'clients') && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <User className="w-3.5 h-3.5" /> Clients ({matchedClients.length})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('clients');
                    onClose();
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline capitalize"
                >
                  View in Directory →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchedClients.slice(0, 6).map((client) => {
                  const compName = companyMap.get(client.companyId) || 'Main Branch';
                  const assignedEmpNames = (client.assignedEmployeeIds || [])
                    .map((id) => userMap.get(id))
                    .filter(Boolean)
                    .join(', ');

                  return (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClientId(client.id);
                        setActiveTab('clients');
                        onClose();
                      }}
                      className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={client.avatar}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 flex-wrap">
                            <span className="truncate">{client.fullName}</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800 font-mono">
                              {client.refNo}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {compName}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                            <span>Passport: {client.passportNo}</span>
                            <span>•</span>
                            <span>{client.nationality}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {client.currentStageName}
                            </span>
                            {assignedEmpNames && (
                              <>
                                <span>•</span>
                                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  Agent: {assignedEmpNames}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Leads */}
          {matchedLeads.length > 0 && (activeEntityType === 'all' || activeEntityType === 'leads') && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <Briefcase className="w-3.5 h-3.5" /> Leads & Inquiries ({matchedLeads.length})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('leads');
                    onClose();
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline capitalize"
                >
                  View in Pipeline →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchedLeads.slice(0, 6).map((lead) => {
                  const compName = companyMap.get(lead.companyId) || lead.branchName || 'Main Branch';
                  return (
                    <button
                      key={lead.id}
                      onClick={() => {
                        setActiveTab('leads');
                        onClose();
                      }}
                      className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 group cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 flex-wrap">
                          <span className="truncate">{lead.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-800 font-mono">
                            {lead.refNo}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {compName}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800 capitalize">
                            {lead.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span>Service: {lead.serviceInterested || lead.category || 'General Consultation'}</span>
                          {lead.currentLocation && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" /> {lead.currentLocation}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            Staff: {lead.assignedEmployeeName || userMap.get(lead.assignedEmployeeId) || 'Assigned Agent'}
                          </span>
                          {lead.estimatedValue > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                AED {lead.estimatedValue.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Staff & Employees */}
          {matchedEmployees.length > 0 && (activeEntityType === 'all' || activeEntityType === 'employees') && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Users className="w-3.5 h-3.5" /> Staff & Employees ({matchedEmployees.length})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('employees');
                    onClose();
                  }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline capitalize"
                >
                  Manage Team →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchedEmployees.slice(0, 5).map((employee) => {
                  const compName = employee.companyId ? companyMap.get(employee.companyId) || 'All Branches' : 'Global Admin';
                  return (
                    <button
                      key={employee.id}
                      onClick={() => {
                        setActiveTab('employees');
                        onClose();
                      }}
                      className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={employee.avatar}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 flex-wrap">
                            <span className="truncate">{employee.name}</span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full border capitalize font-medium ${getRoleBadgeColor(
                                employee.role
                              )}`}
                            >
                              {employee.role}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {compName}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                            <span>{employee.title || employee.jobTitle || 'Operations Specialist'}</span>
                            <span>•</span>
                            <span>{employee.email}</span>
                            <span>•</span>
                            <span>{employee.phone}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Documents */}
          {matchedDocs.length > 0 && (activeEntityType === 'all' || activeEntityType === 'documents') && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <FileText className="w-3.5 h-3.5" /> Documents & Files ({matchedDocs.length})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('documents');
                    onClose();
                  }}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline capitalize"
                >
                  Open Vault →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchedDocs.slice(0, 5).map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      if (doc.clientId) setSelectedClientId(doc.clientId);
                      setActiveTab('documents');
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700/60 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200 dark:border-amber-900">
                        {doc.category.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                          {doc.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>Client: {doc.clientName || 'General'}</span>
                          <span>•</span>
                          <span className="capitalize text-emerald-600 font-medium">{doc.status}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Invoices & Receipts */}
          {matchedInvoices.length > 0 && (activeEntityType === 'all' || activeEntityType === 'invoices') && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-3.5 h-3.5" /> Invoices & Receipts ({matchedInvoices.length})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('payments');
                    onClose();
                  }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline capitalize"
                >
                  View Invoices →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchedInvoices.slice(0, 5).map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => {
                      setActiveTab('payments');
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700/60 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200 dark:border-emerald-900 font-mono">
                        INV
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 flex-wrap">
                          <span>{inv.invoiceNumber}</span>
                          <span className="text-xs text-slate-500 font-normal">({inv.clientName})</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            AED {inv.grandTotal.toLocaleString()}
                          </span>
                          <span>•</span>
                          <span className="capitalize font-medium text-emerald-600">{inv.status.replace('_', ' ')}</span>
                          {inv.receiptNumber && <span>• Receipt: {inv.receiptNumber}</span>}
                          {inv.issuedByUserName && <span>• Issued by: {inv.issuedByUserName}</span>}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Tasks */}
          {matchedTasks.length > 0 && (activeEntityType === 'all' || activeEntityType === 'tasks') && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <CheckSquare className="w-3.5 h-3.5" /> Operations Tasks ({matchedTasks.length})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    onClose();
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline capitalize"
                >
                  View Tasks Scheduler →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchedTasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setActiveTab('tasks');
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700/60 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 flex-wrap">
                        <span className="truncate">{task.title}</span>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full border capitalize">
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Assigned: {task.assignedEmployeeName}
                        </span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                        {task.clientName && <span>• Client: {task.clientName}</span>}
                        {task.leadName && <span>• Lead: {task.leadName}</span>}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Companies & Branches */}
          {matchedCompanies.length > 0 && (activeEntityType === 'all' || activeEntityType === 'companies') && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-3.5 h-3.5" /> Companies & Branches ({matchedCompanies.length})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('companies');
                    onClose();
                  }}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline capitalize"
                >
                  Manage Entities →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchedCompanies.slice(0, 5).map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompanyId(comp.id);
                      setActiveTab('companies');
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700/60 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={comp.logo}
                        alt=""
                        className="w-9 h-9 rounded-lg object-contain bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                          <span className="truncate">{comp.name}</span>
                          {comp.city && (
                            <span className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-200 dark:border-indigo-800">
                              {comp.city}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                          <span>Trade License: {comp.tradeLicenseNo}</span>
                          <span>•</span>
                          <span>TRN: {comp.trn}</span>
                          {comp.email && <span>• {comp.email}</span>}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section: Vendors */}
          {matchedVendors.length > 0 && (activeEntityType === 'all' || activeEntityType === 'vendors') && (
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                  <Layers className="w-3.5 h-3.5" /> External Vendors & Partners ({matchedVendors.length})
                </span>
                <button
                  onClick={() => {
                    setActiveTab('vendors');
                    onClose();
                  }}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline capitalize"
                >
                  Manage Vendors →
                </button>
              </div>
              <div className="space-y-1.5">
                {matchedVendors.slice(0, 4).map((vendor) => (
                  <button
                    key={vendor.id}
                    onClick={() => {
                      setActiveTab('vendors');
                      onClose();
                    }}
                    className="w-full text-left flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700/60 group cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                        <span className="truncate">{vendor.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-md border border-cyan-200 dark:border-cyan-800">
                          {vendor.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                        <span>Contact: {vendor.contactPerson}</span>
                        <span>•</span>
                        <span>{vendor.phone}</span>
                        {vendor.email && <span>• {vendor.email}</span>}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info & shortcut hints */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-[10px]">
                Esc
              </kbd>{' '}
              to close
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Search across all departments & branches instantly</span>
          </div>
          <div className="text-[11px] font-medium text-slate-400">
            Adcs CRM Universal Search Engine
          </div>
        </div>
      </div>
    </div>
  );
};

