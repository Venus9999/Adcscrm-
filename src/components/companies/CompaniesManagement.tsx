import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Briefcase,
  DollarSign,
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
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Company } from '../../types/crm';

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

  const [formData, setFormData] = useState({
    name: '',
    tradeLicenseNo: '',
    licenseExpiryDate: '2027-01-01',
    trn: '',
    country: 'United Arab Emirates',
    city: 'Dubai',
    address: '',
    phone: '+971 4 ',
    email: '',
    currency: 'AED',
    corporateDiscountType: 'percentage' as 'percentage' | 'fixed',
    corporateDiscountValue: 15,
    corporateDiscountPercent: 15,
    assignedAdminIds: [] as string[],
    employeeIds: [] as string[],
    bankName: 'Emirates NBD',
    accountNumber: '1029384756',
    iban: 'AE12033102938475601',
    swift: 'EBILAEADXXX',
  });

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      tradeLicenseNo: `TL-${Math.floor(10000 + Math.random() * 90000)}`,
      licenseExpiryDate: '2027-06-30',
      trn: '100' + Math.floor(10000000000 + Math.random() * 90000000000),
      country: 'United Arab Emirates',
      city: 'Dubai',
      address: 'Business Bay, Dubai, UAE',
      phone: '+971 4 399 0000',
      email: 'info@branch.ae',
      currency: 'AED',
      corporateDiscountType: 'percentage',
      corporateDiscountValue: 15,
      corporateDiscountPercent: 15,
      assignedAdminIds: [currentUser.role === 'admin' || currentUser.role === 'master' ? currentUser.id : 'user-master'],
      employeeIds: [] as string[],
      bankName: 'Emirates NBD',
      accountNumber: '1029384756',
      iban: 'AE12033102938475601',
      swift: 'EBILAEADXXX',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    const discType = comp.corporateDiscountType || 'percentage';
    const discVal = comp.corporateDiscountValue ?? comp.corporateDiscountPercent ?? 15;
    setFormData({
      name: comp.name ?? '',
      tradeLicenseNo: comp.tradeLicenseNo ?? '',
      licenseExpiryDate: comp.licenseExpiryDate ?? '',
      trn: comp.trn ?? '',
      country: comp.country || 'United Arab Emirates',
      city: comp.city || 'Dubai',
      address: comp.address ?? '',
      phone: comp.phone ?? '',
      email: comp.email ?? '',
      currency: comp.currency ?? 'AED',
      corporateDiscountType: discType,
      corporateDiscountValue: discVal,
      corporateDiscountPercent: discType === 'percentage' ? discVal : (comp.corporateDiscountPercent ?? 15),
      assignedAdminIds: comp.assignedAdminIds || (comp.adminId ? [comp.adminId] : []),
      employeeIds: comp.employeeIds || [],
      bankName: comp.bankDetails?.bankName || 'Emirates NBD',
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
    const discountPercent = formData.corporateDiscountType === 'percentage' ? discountVal : Math.min(100, Math.round((discountVal / 3000) * 100));

    if (editingCompany) {
      updateCompany(editingCompany.id, {
        name: formData.name,
        tradeLicenseNo: formData.tradeLicenseNo,
        licenseExpiryDate: formData.licenseExpiryDate,
        trn: formData.trn,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
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
        tradeLicenseNo: formData.tradeLicenseNo,
        licenseIssueDate: new Date().toISOString().split('T')[0],
        licenseExpiryDate: formData.licenseExpiryDate,
        trn: formData.trn,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        whatsapp: formData.phone,
        corporateDiscountType: formData.corporateDiscountType,
        corporateDiscountValue: discountVal,
        corporateDiscountPercent: discountPercent,
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Companies & Branch Entities</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {companies.length} Registered Entities
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage legal entities, corporate trade licenses, TRN tax IDs, and assign branch administrators
          </p>
        </div>

        {currentUser.role === 'master' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Branch Entity</span>
          </button>
        )}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(companies || []).map((comp) => {
          if (!comp) return null;
          const compClients = (clients || []).filter((c) => c && c.companyId === comp.id);
          const compInvoices = (invoices || []).filter((i) => i && i.companyId === comp.id);
          const compRevenue = compInvoices.reduce((acc, i) => acc + (i?.amountPaid || 0), 0);
          const compAdmins = (users || []).filter((u) => u && (comp.assignedAdminIds || [comp.adminId]).includes(u.id));

          return (
            <div
              key={comp.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm shadow-xs">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{comp.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{comp.city}, {comp.country}</p>
                    </div>
                  </div>

                  {currentUser.role === 'master' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(comp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Company Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(comp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Company Entity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Trade License:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{comp.tradeLicenseNo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">License Expiry:</span>
                    <span className="text-emerald-600 font-medium font-mono">{comp.licenseExpiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">TRN / Tax No:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{comp.trn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Corporate B2B Discount:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                      {comp.corporateDiscountType === 'fixed' ? (
                        <>
                          <span>AED {(comp.corporateDiscountValue ?? 500).toLocaleString()}</span>
                          <span className="text-[9px] opacity-75 font-normal">Fixed Off</span>
                        </>
                      ) : (
                        <>
                          <span>{comp.corporateDiscountValue ?? comp.corporateDiscountPercent ?? 15}%</span>
                          <span className="text-[9px] opacity-75 font-normal">Off Catalog</span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Contact Phone:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">{comp.phone}</span>
                  </div>
                </div>

                {comp.bankDetails && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                      <CreditCard className="w-3 h-3 text-blue-500" />
                      <span>{comp.bankDetails.bankName}</span>
                    </div>
                    <div className="font-mono text-slate-500 truncate">
                      IBAN: {comp.bankDetails.iban}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Assigned Branch Admins:</span>
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

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                <div
                  onClick={() => {
                    setSelectedCompanyId(comp.id);
                    setActiveTab('clients');
                  }}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  title="View Clients in this Company"
                >
                  <div className="font-bold text-slate-900 dark:text-white">{compClients.length}</div>
                  <div className="text-[10px] text-slate-400">Clients</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-bold text-blue-600 dark:text-blue-400">{comp.activeServicesCount || compClients.length}</div>
                  <div className="text-[10px] text-slate-400">Active Cases</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-bold text-emerald-600 font-mono">AED {compRevenue.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Revenue</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>{editingCompany ? 'Edit Branch Entity' : 'Register New Company Branch'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company / Legal Branch Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. ADCS Dubai Global Gateway PRO LLC"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Trade License Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tradeLicenseNo ?? ''}
                    onChange={(e) => setFormData({ ...formData, tradeLicenseNo: e.target.value })}
                    placeholder="TL-98421"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    TRN / Tax Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.trn ?? ''}
                    onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                    placeholder="10098421000003"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Operating Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency ?? ''}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="AED"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email ?? ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={formData.address ?? ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Al Saada Tower, Business Bay, Dubai"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Corporate B2B Service Discount (2 Forms: % or Fixed Amount) */}
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Corporate B2B Partner Discount
                    </label>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                      Default discount applied to service fees when registering clients under this company
                    </p>
                  </div>

                  {/* Discount Type Toggle */}
                  <div className="flex p-0.5 bg-indigo-200/60 dark:bg-indigo-900/60 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          corporateDiscountType: 'percentage',
                          corporateDiscountValue: formData.corporateDiscountType === 'percentage' ? formData.corporateDiscountValue : 15,
                        });
                      }}
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
                      onClick={() => {
                        setFormData({
                          ...formData,
                          corporateDiscountType: 'fixed',
                          corporateDiscountValue: formData.corporateDiscountType === 'fixed' ? formData.corporateDiscountValue : 500,
                        });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        formData.corporateDiscountType === 'fixed'
                          ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-xs'
                          : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-900'
                      }`}
                    >
                      AED Fixed Amount
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {formData.corporateDiscountType === 'percentage'
                      ? 'Discount Percentage (% deducted from standard retail fees)'
                      : 'Fixed Discount Amount (AED deducted per service)'}
                  </span>
                  <div className="relative w-36 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max={formData.corporateDiscountType === 'percentage' ? 100 : 50000}
                      value={formData.corporateDiscountValue}
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

              {/* Bank Details */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Corporate Bank Account Information
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName ?? ''}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="Emirates NBD"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">IBAN</label>
                    <input
                      type="text"
                      value={formData.iban ?? ''}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      placeholder="AE12033102938475601"
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Multi-Admin Assignment */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assign Branch Administrators
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
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
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

              {/* Multi-Staff & Agent Assignment to Company */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assign Staff & Field Agents to Branch
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
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
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

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {editingCompany ? 'Save Changes' : 'Create Branch Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Company Entity</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">
              Are you sure you want to permanently delete <strong>{companyToDelete.name}</strong>?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Yes, Delete Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
