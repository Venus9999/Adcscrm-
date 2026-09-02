import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  X,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  AlertTriangle,
  FileText,
  CreditCard,
  GitBranch,
  Search,
  Check,
  Layers,
  MapPin,
  Percent,
  Sparkles,
  ChevronRight,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Company, User } from '../../types/crm';

export const CompaniesManagement: React.FC = () => {
  const {
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    users,
    clients,
    invoices,
    currentUser,
    setSelectedCompanyId,
    setActiveTab,
  } = useCRM();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'company' | 'branch'>('all');

  // Creation Entity Type Choice: 'company' (Standalone/Parent) vs 'branch' (Branch Office)
  const [entityTypeChoice, setEntityTypeChoice] = useState<'company' | 'branch'>('company');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [inheritParentBank, setInheritParentBank] = useState<boolean>(true);
  const [inheritParentDiscount, setInheritParentDiscount] = useState<boolean>(true);

  const [formData, setFormData] = useState({
    name: '',
    branchName: '',
    branchCode: '',
    branchLocation: '',
    tradeLicenseNo: '',
    licenseExpiryDate: '2027-06-30',
    trn: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: '',
    phone: '+971 4 399 0000',
    email: '',
    whatsapp: '+971 50 000 0000',
    currency: 'AED',
    corporateDiscountType: 'percentage' as 'percentage' | 'fixed',
    corporateDiscountValue: 15,
    corporateDiscountPercent: 15,
    assignedAdminIds: [] as string[],
    employeeIds: [] as string[],
    bankName: 'Emirates NBD Business Banking',
    accountNumber: '1029384756',
    iban: 'AE12033102938475601',
    swift: 'EBILAEADXXX',
  });

  // Permission Checks based on Role & Capabilities
  const isSalesStaff =
    currentUser.role?.toLowerCase() === 'sales' ||
    currentUser.department?.toLowerCase().includes('sales') ||
    currentUser.jobTitle?.toLowerCase().includes('sales') ||
    currentUser.customRoleId === 'role-sales';

  const canCreateCompany =
    currentUser.role === 'master' ||
    Boolean(currentUser.permissions?.canCreateCompanies) ||
    Boolean(currentUser.permissions?.canCreateCompany) ||
    Boolean(currentUser.permissions?.canManageCompanies) ||
    isSalesStaff;

  const canCreateBranch =
    currentUser.role === 'master' ||
    currentUser.role === 'admin' ||
    Boolean(currentUser.permissions?.canCreateBranches) ||
    Boolean(currentUser.permissions?.canCreateBranch) ||
    Boolean(currentUser.permissions?.canManageBranches) ||
    Boolean(currentUser.permissions?.canManageCompanies) ||
    isSalesStaff;

  const canAnyCreate = canCreateCompany || canCreateBranch;

  const canEditEntity = (comp: Company) => {
    if (currentUser.role === 'master') return true;
    if (comp.isBranch || comp.entityType === 'branch') {
      return (
        Boolean(currentUser.permissions?.canManageBranches) ||
        Boolean(currentUser.permissions?.canManageCompanies) ||
        (comp.assignedAdminIds && comp.assignedAdminIds.includes(currentUser.id))
      );
    }
    return Boolean(currentUser.permissions?.canManageCompanies);
  };

  const canDeleteEntity =
    currentUser.role === 'master' || Boolean(currentUser.permissions?.canDeleteRecords);

  // Available parent companies (entities that are not branches)
  const parentCompanies = useMemo(() => {
    return companies.filter((c) => !c.isBranch && c.entityType !== 'branch');
  }, [companies]);

  // Open modal to add a brand new entity
  const handleOpenAdd = (defaultType: 'company' | 'branch' = 'company', preselectedParentId?: string) => {
    setEditingCompany(null);
    const chosenType = canCreateCompany ? defaultType : 'branch';
    setEntityTypeChoice(chosenType);

    const initialParent =
      preselectedParentId || (parentCompanies.length > 0 ? parentCompanies[0].id : '');
    setSelectedParentId(initialParent);

    const parentObj = companies.find((c) => c.id === initialParent);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedTradeLicense = `TL-${Math.floor(10000 + Math.random() * 90000)}`;

    if (chosenType === 'branch' && parentObj) {
      const branchCount = companies.filter((c) => c.parentCompanyId === parentObj.id).length + 1;
      const branchCodeStr = `BR-${(parentObj.city || 'DXB').slice(0, 3).toUpperCase()}-0${branchCount}`;

      setFormData({
        name: `${parentObj.name} - ${parentObj.city || 'Dubai'} Branch`,
        branchName: `${parentObj.city || 'Dubai'} Branch`,
        branchCode: branchCodeStr,
        branchLocation: parentObj.city || 'Dubai',
        tradeLicenseNo: `${parentObj.tradeLicenseNo}-BR${branchCount}`,
        licenseExpiryDate: parentObj.licenseExpiryDate || '2027-06-30',
        trn: parentObj.trn || '100' + Math.floor(10000000000 + Math.random() * 90000000000),
        country: parentObj.country || 'United Arab Emirates',
        city: parentObj.city || 'Dubai',
        address: parentObj.address || 'Business Bay, Dubai, UAE',
        phone: parentObj.phone || '+971 4 399 0000',
        email: `branch.${branchCount}@${parentObj.email ? parentObj.email.split('@')[1] : 'adcs.ae'}`,
        whatsapp: parentObj.whatsapp || '+971 50 000 0000',
        currency: parentObj.currency || 'AED',
        corporateDiscountType: parentObj.corporateDiscountType || 'percentage',
        corporateDiscountValue: parentObj.corporateDiscountValue ?? parentObj.corporateDiscountPercent ?? 15,
        corporateDiscountPercent: parentObj.corporateDiscountPercent ?? 15,
        assignedAdminIds: [currentUser.id],
        employeeIds: [] as string[],
        bankName: parentObj.bankDetails?.bankName || 'Emirates NBD Business Banking',
        accountNumber: parentObj.bankDetails?.accountNumber || '1029384756',
        iban: parentObj.bankDetails?.iban || 'AE12033102938475601',
        swift: parentObj.bankDetails?.swift || 'EBILAEADXXX',
      });
    } else {
      setFormData({
        name: '',
        branchName: '',
        branchCode: '',
        branchLocation: '',
        tradeLicenseNo: generatedTradeLicense,
        licenseExpiryDate: '2027-06-30',
        trn: '100' + Math.floor(10000000000 + Math.random() * 90000000000),
        country: 'United Arab Emirates',
        city: 'Dubai',
        address: 'Iris Bay Tower, Business Bay, Dubai, UAE',
        phone: '+971 4 829 1100',
        email: 'info@company.ae',
        whatsapp: '+971 50 829 1100',
        currency: 'AED',
        corporateDiscountType: 'percentage',
        corporateDiscountValue: 15,
        corporateDiscountPercent: 15,
        assignedAdminIds: [currentUser.id],
        employeeIds: [] as string[],
        bankName: 'Emirates NBD Business Banking',
        accountNumber: '102938475601',
        iban: 'AE290260000102938475601',
        swift: 'EBILAEADXXX',
      });
    }

    setInheritParentBank(true);
    setInheritParentDiscount(true);
    setShowModal(true);
  };

  // Handle switching entity type in the creation modal
  const handleSelectEntityType = (type: 'company' | 'branch') => {
    setEntityTypeChoice(type);
    if (type === 'branch') {
      const defaultParent = selectedParentId || (parentCompanies.length > 0 ? parentCompanies[0].id : '');
      setSelectedParentId(defaultParent);
      const parentObj = companies.find((c) => c.id === defaultParent);
      if (parentObj) {
        const branchCount = companies.filter((c) => c.parentCompanyId === parentObj.id).length + 1;
        setFormData((prev) => ({
          ...prev,
          name: prev.name || `${parentObj.name} - Branch Office`,
          branchName: prev.branchName || 'Branch Office',
          branchCode: prev.branchCode || `BR-${(parentObj.city || 'DXB').slice(0, 3).toUpperCase()}-0${branchCount}`,
          branchLocation: prev.branchLocation || parentObj.city || 'Dubai',
          trn: parentObj.trn || prev.trn,
          bankName: parentObj.bankDetails?.bankName || prev.bankName,
          iban: parentObj.bankDetails?.iban || prev.iban,
          accountNumber: parentObj.bankDetails?.accountNumber || prev.accountNumber,
          swift: parentObj.bankDetails?.swift || prev.swift,
        }));
      }
    }
  };

  // When changing parent company dropdown for branch
  const handleParentChange = (parentId: string) => {
    setSelectedParentId(parentId);
    const parentObj = companies.find((c) => c.id === parentId);
    if (parentObj && inheritParentBank) {
      setFormData((prev) => ({
        ...prev,
        trn: parentObj.trn || prev.trn,
        country: parentObj.country || prev.country,
        currency: parentObj.currency || prev.currency,
        bankName: parentObj.bankDetails?.bankName || prev.bankName,
        iban: parentObj.bankDetails?.iban || prev.iban,
        accountNumber: parentObj.bankDetails?.accountNumber || prev.accountNumber,
        swift: parentObj.bankDetails?.swift || prev.swift,
      }));
    }
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    const isBranchEntity = Boolean(comp.isBranch || comp.entityType === 'branch');
    setEntityTypeChoice(isBranchEntity ? 'branch' : 'company');
    setSelectedParentId(comp.parentCompanyId || '');

    const discType = comp.corporateDiscountType || 'percentage';
    const discVal = comp.corporateDiscountValue ?? comp.corporateDiscountPercent ?? 15;

    setFormData({
      name: comp.name ?? '',
      branchName: comp.branchName || '',
      branchCode: comp.branchCode || '',
      branchLocation: comp.branchLocation || comp.city || '',
      tradeLicenseNo: comp.tradeLicenseNo ?? '',
      licenseExpiryDate: comp.licenseExpiryDate ?? '',
      trn: comp.trn ?? '',
      country: comp.country || 'United Arab Emirates',
      city: comp.city || 'Dubai',
      address: comp.address ?? '',
      phone: comp.phone ?? '',
      email: comp.email ?? '',
      whatsapp: comp.whatsapp ?? comp.phone ?? '',
      currency: comp.currency ?? 'AED',
      corporateDiscountType: discType,
      corporateDiscountValue: discVal,
      corporateDiscountPercent: discType === 'percentage' ? discVal : (comp.corporateDiscountPercent ?? 15),
      assignedAdminIds: comp.assignedAdminIds || (comp.adminId ? [comp.adminId] : []),
      employeeIds: comp.employeeIds || [],
      bankName: comp.bankDetails?.bankName || 'Emirates NBD Business Banking',
      accountNumber: comp.bankDetails?.accountNumber || '1029384756',
      iban: comp.bankDetails?.iban || 'AE12033102938475601',
      swift: comp.bankDetails?.swift || 'EBILAEADXXX',
    });
    setShowModal(true);
  };

  const handleOpenDelete = (comp: Company) => {
    setCompanyToDelete(comp);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!companyToDelete) return;
    deleteCompany(companyToDelete.id);
    setShowDeleteModal(false);
    setCompanyToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const discountVal = Number(formData.corporateDiscountValue) || 0;
    const discountPercent =
      formData.corporateDiscountType === 'percentage'
        ? discountVal
        : Math.min(100, Math.round((discountVal / 3000) * 100));

    const isBranch = entityTypeChoice === 'branch';
    const parentObj = isBranch ? companies.find((c) => c.id === selectedParentId) : undefined;

    if (editingCompany) {
      updateCompany(editingCompany.id, {
        name: formData.name,
        branchName: isBranch ? formData.branchName : undefined,
        branchCode: isBranch ? formData.branchCode : undefined,
        branchLocation: isBranch ? formData.branchLocation : undefined,
        isBranch: isBranch,
        entityType: isBranch ? 'branch' : 'company',
        parentCompanyId: isBranch ? selectedParentId : undefined,
        parentCompanyName: isBranch && parentObj ? parentObj.name : undefined,
        tradeLicenseNo: formData.tradeLicenseNo,
        licenseExpiryDate: formData.licenseExpiryDate,
        trn: formData.trn,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        whatsapp: formData.whatsapp,
        currency: formData.currency,
        corporateDiscountType: formData.corporateDiscountType,
        corporateDiscountValue: discountVal,
        corporateDiscountPercent: discountPercent,
        adminId: formData.assignedAdminIds[0] || editingCompany.adminId || 'user-master',
        assignedAdminIds: formData.assignedAdminIds,
        employeeIds: formData.employeeIds,
        bankDetails: {
          bankName: formData.bankName,
          accountName: formData.name,
          accountNumber: formData.accountNumber,
          iban: formData.iban,
          swift: formData.swift,
        },
      });
    } else {
      addCompany({
        name: formData.name,
        branchName: isBranch ? formData.branchName : undefined,
        branchCode: isBranch ? formData.branchCode : undefined,
        branchLocation: isBranch ? formData.branchLocation : undefined,
        isBranch: isBranch,
        entityType: isBranch ? 'branch' : 'company',
        parentCompanyId: isBranch ? selectedParentId : undefined,
        parentCompanyName: isBranch && parentObj ? parentObj.name : undefined,
        tradeLicenseNo: formData.tradeLicenseNo,
        licenseIssueDate: new Date().toISOString().split('T')[0],
        licenseExpiryDate: formData.licenseExpiryDate,
        trn: formData.trn,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        whatsapp: formData.whatsapp,
        corporateDiscountType: formData.corporateDiscountType,
        corporateDiscountValue: discountVal,
        corporateDiscountPercent: discountPercent,
        logo: isBranch && parentObj?.logo
          ? parentObj.logo
          : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
        bankDetails: {
          bankName: formData.bankName,
          accountName: formData.name,
          accountNumber: formData.accountNumber,
          iban: formData.iban,
          swift: formData.swift,
        },
        adminId: formData.assignedAdminIds[0] || currentUser.id || 'user-master',
        assignedAdminIds: formData.assignedAdminIds,
        employeeIds: formData.employeeIds,
        currency: formData.currency,
      });
    }
    setShowModal(false);
  };

  const adminUsers = (users || []).filter((u) => u && (u.role === 'admin' || u.role === 'master'));
  const staffAndAgentUsers = (users || []).filter((u) => u && (u.role === 'employee' || u.role === 'agent'));

  // Filter and search entities
  const filteredCompanies = useMemo(() => {
    return (companies || []).filter((comp) => {
      if (!comp) return false;
      const isBranch = Boolean(comp.isBranch || comp.entityType === 'branch');

      if (filterType === 'company' && isBranch) return false;
      if (filterType === 'branch' && !isBranch) return false;

      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        (comp.name && comp.name.toLowerCase().includes(q)) ||
        (comp.branchCode && comp.branchCode.toLowerCase().includes(q)) ||
        (comp.branchLocation && comp.branchLocation.toLowerCase().includes(q)) ||
        (comp.city && comp.city.toLowerCase().includes(q)) ||
        (comp.tradeLicenseNo && comp.tradeLicenseNo.toLowerCase().includes(q)) ||
        (comp.trn && comp.trn.toLowerCase().includes(q)) ||
        (comp.parentCompanyName && comp.parentCompanyName.toLowerCase().includes(q))
      );
    });
  }, [companies, filterType, searchTerm]);

  const standaloneCount = companies.filter((c) => !c.isBranch && c.entityType !== 'branch').length;
  const branchCount = companies.filter((c) => c.isBranch || c.entityType === 'branch').length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Companies & Branch Directory</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {companies.length} Total Entities
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Configure multi-entity corporate structures, trade licenses, TRN tax identifiers, branch networks, and administrator assignments.
          </p>
        </div>

        {/* Action Buttons based on User Permissions */}
        {canAnyCreate && (
          <div className="flex items-center gap-2 shrink-0">
            {canCreateCompany && (
              <button
                onClick={() => handleOpenAdd('company')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>+ Register Company</span>
              </button>
            )}

            {canCreateBranch && parentCompanies.length > 0 && (
              <button
                onClick={() => handleOpenAdd('branch')}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <GitBranch className="w-4 h-4" />
                <span>+ Add Branch Office</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Entities ({companies.length})</span>
          </button>

          <button
            onClick={() => setFilterType('company')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'company'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Parent Companies ({standaloneCount})</span>
          </button>

          <button
            onClick={() => setFilterType('branch')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterType === 'branch'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Branch Offices ({branchCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, branch code, city, TRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {filteredCompanies.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Corporate Entities Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No entities matching "${searchTerm}". Try resetting your search filters.`
              : 'Register your first standalone company or branch office to get started.'}
          </p>
          {canAnyCreate && !searchTerm && (
            <button
              onClick={() => handleOpenAdd('company')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Company</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((comp) => {
            const isBranch = Boolean(comp.isBranch || comp.entityType === 'branch');
            const compClients = (clients || []).filter((c) => c && c.companyId === comp.id);
            const compInvoices = (invoices || []).filter((i) => i && i.companyId === comp.id);
            const compRevenue = compInvoices.reduce((acc, i) => acc + (i?.amountPaid || 0), 0);
            const compAdmins = (users || []).filter((u) => u && (comp.assignedAdminIds || [comp.adminId]).includes(u.id));

            // Branches under this company (if parent)
            const registeredBranches = companies.filter((c) => c.parentCompanyId === comp.id);

            return (
              <div
                key={comp.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between hover:shadow-lg ${
                  isBranch
                    ? 'bg-slate-900/40 dark:bg-slate-900/70 border-cyan-500/30 dark:border-cyan-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${
                          isBranch
                            ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {isBranch ? <GitBranch className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isBranch ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              <span>Branch Office</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>Parent Entity</span>
                            </span>
                          )}

                          {comp.branchCode && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {comp.branchCode}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight mt-1 truncate" title={comp.name}>
                          {comp.name}
                        </h3>

                        {isBranch && comp.parentCompanyName && (
                          <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                            <span>Branch of:</span>
                            <span className="font-bold underline cursor-pointer truncate" onClick={() => setSelectedCompanyId(comp.parentCompanyId || '')}>
                              {comp.parentCompanyName}
                            </span>
                          </p>
                        )}

                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{comp.city || 'Dubai'}, {comp.country || 'UAE'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {canEditEntity(comp) && (
                        <button
                          onClick={() => handleOpenEdit(comp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Entity Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDeleteEntity && (
                        <button
                          onClick={() => handleOpenDelete(comp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Entity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Registered Branches preview under parent */}
                  {!isBranch && (
                    <div className="p-2.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {registeredBranches.length} Branch {registeredBranches.length === 1 ? 'Office' : 'Offices'}
                        </span>
                      </div>

                      {canCreateBranch && (
                        <button
                          onClick={() => handleOpenAdd('branch', comp.id)}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>+ Add Branch</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Legal & Tax Specs */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Trade License:</span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{comp.tradeLicenseNo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">License Expiry:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono">{comp.licenseExpiryDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">TRN / Tax ID:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{comp.trn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">B2B Corporate Discount:</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                        {comp.corporateDiscountType === 'fixed' ? (
                          <>
                            <span>AED {(comp.corporateDiscountValue ?? 500).toLocaleString()}</span>
                            <span className="opacity-75 font-normal">Fixed Off</span>
                          </>
                        ) : (
                          <>
                            <span>{comp.corporateDiscountValue ?? comp.corporateDiscountPercent ?? 15}%</span>
                            <span className="opacity-75 font-normal">Catalog Rate</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Bank Details */}
                  {comp.bankDetails && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        <CreditCard className="w-3 h-3 text-blue-500" />
                        <span>{comp.bankDetails.bankName}</span>
                      </div>
                      <div className="font-mono text-slate-500 dark:text-slate-400 truncate text-[10px]">
                        IBAN: {comp.bankDetails.iban}
                      </div>
                    </div>
                  )}

                  {/* Assigned Branch Admins */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      {isBranch ? 'Assigned Branch Managers / Admins:' : 'Corporate Entity Admins:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {compAdmins.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">No assigned admins</span>
                      ) : (
                        compAdmins.map((adm) => (
                          <span
                            key={adm.id}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1"
                          >
                            <ShieldCheck className="w-2.5 h-2.5 text-blue-500" />
                            <span>{adm.name}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                  <div
                    onClick={() => {
                      setSelectedCompanyId(comp.id);
                      setActiveTab('clients');
                    }}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    title="View Clients in this Entity"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">{compClients.length}</div>
                    <div className="text-[10px] text-slate-400">Clients</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <div className="font-bold text-blue-600 dark:text-blue-400">{comp.activeServicesCount || compClients.length}</div>
                    <div className="text-[10px] text-slate-400">Active Cases</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">AED {compRevenue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">Revenue</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT ENTITY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
                    entityTypeChoice === 'branch' ? 'bg-cyan-600' : 'bg-blue-600'
                  }`}
                >
                  {entityTypeChoice === 'branch' ? <GitBranch className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingCompany
                      ? `Edit ${editingCompany.isBranch ? 'Branch Office' : 'Company Entity'}`
                      : entityTypeChoice === 'branch'
                      ? 'Register New Branch Office'
                      : 'Register New Standalone Company'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingCompany
                      ? 'Update trade license, corporate banking, and governance profiles'
                      : 'Choose between a standalone parent company or a subsidiary branch office'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
              {/* PRIMARY CHOICE: Standalone Company vs. Branch Office (when creating new) */}
              {!editingCompany && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <span>Select Entity Type to Register *</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Governed by your role capabilities
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Standalone Company */}
                    <div
                      onClick={() => canCreateCompany && handleSelectEntityType('company')}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                        !canCreateCompany
                          ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200'
                          : entityTypeChoice === 'company'
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs cursor-pointer ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              New Standalone Company
                            </div>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                              Parent Entity
                            </span>
                          </div>
                        </div>
                        {entityTypeChoice === 'company' && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Independent legal commercial entity with separate Trade License, TRN, and governance.
                      </p>
                    </div>

                    {/* Option 2: Branch Office */}
                    <div
                      onClick={() => canCreateBranch && handleSelectEntityType('branch')}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                        !canCreateBranch || parentCompanies.length === 0
                          ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 border-slate-200'
                          : entityTypeChoice === 'branch'
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-950 dark:text-cyan-100 shadow-xs cursor-pointer ring-2 ring-cyan-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-300 flex items-center justify-center">
                            <GitBranch className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              Branch Office
                            </div>
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                              Subsidiary Location
                            </span>
                          </div>
                        </div>
                        {entityTypeChoice === 'branch' && (
                          <div className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Regional office or desk linked under an existing parent company with shared corporate identity.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PARENT COMPANY SELECTOR (when Branch is selected) */}
              {entityTypeChoice === 'branch' && (
                <div className="p-4 bg-cyan-50/70 dark:bg-cyan-950/30 rounded-2xl border border-cyan-200 dark:border-cyan-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Select Parent Corporate Entity *</span>
                    </label>
                    <span className="text-[10px] text-cyan-700 dark:text-cyan-400">
                      Branch will be linked to this parent
                    </span>
                  </div>

                  <select
                    value={selectedParentId}
                    onChange={(e) => handleParentChange(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-cyan-300 dark:border-cyan-700 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  >
                    {parentCompanies.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.name} (TRN: {parent.trn || 'N/A'}) - {parent.city || 'Dubai'}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Branch Code / Identifier *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.branchCode}
                        onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                        placeholder="e.g. BR-AUH-01"
                        className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-cyan-300 dark:border-cyan-700 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Branch Location / Region *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.branchLocation}
                        onChange={(e) => setFormData({ ...formData, branchLocation: e.target.value })}
                        placeholder="e.g. Al Reem Island, Abu Dhabi"
                        className="w-full p-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-cyan-300 dark:border-cyan-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {entityTypeChoice === 'branch' ? 'Branch Official Name *' : 'Company Full Legal Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    entityTypeChoice === 'branch'
                      ? 'e.g. ADCS Corporate Services - Abu Dhabi Branch LLC'
                      : 'e.g. ADCS Document Clearing & Corporate Services LLC'
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-medium"
                />
              </div>

              {/* Trade License & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Trade License Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tradeLicenseNo ?? ''}
                    onChange={(e) => setFormData({ ...formData, tradeLicenseNo: e.target.value })}
                    placeholder="CN-8941029"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.licenseExpiryDate ?? ''}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* TRN & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    TRN / Tax Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.trn ?? ''}
                    onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                    placeholder="100492817400003"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Jurisdiction
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="Dubai">Dubai</option>
                    <option value="Abu Dhabi">Abu Dhabi</option>
                    <option value="Sharjah">Sharjah</option>
                    <option value="Ajman">Ajman</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                    <option value="Fujairah">Fujairah</option>
                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email ?? ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Office Address
                </label>
                <input
                  type="text"
                  value={formData.address ?? ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Floor 12, Tamouh Tower, Marina Square, Al Reem Island"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Corporate B2B Service Discount */}
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Corporate Partner B2B Discount
                    </label>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                      Default discount applied to service fees when clients are onboarded under this entity
                    </p>
                  </div>

                  <div className="flex p-0.5 bg-indigo-200/60 dark:bg-indigo-900/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          corporateDiscountType: 'percentage',
                          corporateDiscountValue:
                            formData.corporateDiscountType === 'percentage'
                              ? formData.corporateDiscountValue
                              : 15,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        formData.corporateDiscountType === 'percentage'
                          ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                          : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-900'
                      }`}
                    >
                      % Percentage
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          corporateDiscountType: 'fixed',
                          corporateDiscountValue:
                            formData.corporateDiscountType === 'fixed'
                              ? formData.corporateDiscountValue
                              : 500,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        formData.corporateDiscountType === 'fixed'
                          ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                          : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-900'
                      }`}
                    >
                      AED Fixed
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {formData.corporateDiscountType === 'percentage'
                      ? 'Discount Percentage (% deducted from standard retail fees)'
                      : 'Fixed Discount Amount (AED deducted per service dossier)'}
                  </span>
                  <div className="relative w-36 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max={formData.corporateDiscountType === 'percentage' ? 100 : 50000}
                      value={formData.corporateDiscountValue ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          corporateDiscountValue: Number(e.target.value),
                          corporateDiscountPercent:
                            formData.corporateDiscountType === 'percentage'
                              ? Number(e.target.value)
                              : formData.corporateDiscountPercent,
                        })
                      }
                      placeholder={formData.corporateDiscountType === 'percentage' ? '15' : '500'}
                      className="w-full p-2 pl-3 pr-10 bg-white dark:bg-slate-900 rounded-xl text-xs font-bold font-mono text-center border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none">
                      {formData.corporateDiscountType === 'percentage' ? '%' : 'AED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Operating Bank Account Profile
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName ?? ''}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="Emirates NBD Business Banking"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={formData.iban ?? ''}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      placeholder="AE290260000102938475601"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Branch Administrator / Manager Assignment */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {entityTypeChoice === 'branch' ? 'Assign Branch Managers / Admins' : 'Assign Corporate Entity Admins'}
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {formData.assignedAdminIds.length} Selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {adminUsers.map((u) => {
                    const isSelected = formData.assignedAdminIds.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => {
                          if (isSelected) {
                            if (formData.assignedAdminIds.length > 1) {
                              setFormData({
                                ...formData,
                                assignedAdminIds: formData.assignedAdminIds.filter((id) => id !== u.id),
                              });
                            }
                          } else {
                            setFormData({
                              ...formData,
                              assignedAdminIds: [...formData.assignedAdminIds, u.id],
                            });
                          }
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <span className="truncate flex-1">{u.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Staff and Agents Assignment */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assign Staff & Field PRO Officers
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {formData.employeeIds.length} Assigned
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {staffAndAgentUsers.map((u) => {
                    const isSelected = formData.employeeIds.includes(u.id);
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              employeeIds: formData.employeeIds.filter((id) => id !== u.id),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              employeeIds: [...formData.employeeIds, u.id],
                            });
                          }
                        }}
                        className={`flex items-center gap-2 p-1.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                        />
                        <span className="truncate flex-1">{u.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all ${
                    entityTypeChoice === 'branch'
                      ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  {editingCompany
                    ? 'Save Entity Changes'
                    : entityTypeChoice === 'branch'
                    ? 'Create Branch Office'
                    : 'Register Company Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Entity</h3>
                <p className="text-xs text-slate-500">This action is audited and irreversible.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Are you sure you want to delete{' '}
              <strong>{companyToDelete.name}</strong>{' '}
              ({companyToDelete.isBranch ? 'Branch Office' : 'Parent Company'})? All associated client dossiers will remain archived under compliance rules.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
