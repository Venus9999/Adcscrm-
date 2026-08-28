import React, { useState } from 'react';
import {
  Handshake,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Users,
  ExternalLink,
  ShieldCheck,
  Building,
  DollarSign,
  Filter,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Vendor } from '../../types/crm';

const VENDOR_CATEGORIES = [
  'All Categories',
  'Typing Center',
  'Legal Translation',
  'Embassy Attestation',
  'Medical Center',
  'Insurance Provider',
  'Courier & Logistics',
  'Real Estate & Ejari',
  'PRO Outsourcing',
  'General Partner',
];

export const VendorsManagement: React.FC = () => {
  const {
    vendors,
    filteredVendors,
    companies,
    clients,
    addVendor,
    updateVendor,
    deleteVendor,
    selectedCompanyId,
    currentUser,
    setSelectedClientId,
    setActiveTab,
  } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [deletingVendorId, setDeletingVendorId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Typing Center' as Vendor['category'],
    companyId: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || 'comp-1',
    contactPerson: '',
    email: '',
    phone: '+971 50 ',
    address: 'Dubai, UAE',
    tradeLicenseNo: '',
    tradeLicenseExpiry: '2028-12-31',
    status: 'active' as Vendor['status'],
    bankName: '',
    iban: '',
    accountNumber: '',
    commissionRate: 5,
    notes: '',
  });

  const handleOpenAddModal = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: 'Typing Center',
      companyId: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || 'comp-1',
      contactPerson: '',
      email: '',
      phone: '+971 50 ',
      address: 'Dubai, UAE',
      tradeLicenseNo: `TL-${Math.floor(100000 + Math.random() * 900000)}`,
      tradeLicenseExpiry: '2028-12-31',
      status: 'active',
      bankName: 'Emirates NBD',
      iban: '',
      accountNumber: '',
      commissionRate: 5,
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (vendor: Vendor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      companyId: vendor.companyId,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address || '',
      tradeLicenseNo: vendor.tradeLicenseNo || '',
      tradeLicenseExpiry: vendor.tradeLicenseExpiry || '',
      status: vendor.status,
      bankName: vendor.bankName || '',
      iban: vendor.iban || '',
      accountNumber: vendor.accountNumber || '',
      commissionRate: vendor.commissionRate || 0,
      notes: vendor.notes || '',
    });
    setShowAddModal(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.email.trim()) {
      alert('Please complete all required fields.');
      return;
    }

    const company = companies.find((c) => c.id === formData.companyId);

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        name: formData.name.trim(),
        category: formData.category,
        companyId: formData.companyId,
        companyName: company?.name || 'ADCS Master Group',
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        tradeLicenseNo: formData.tradeLicenseNo.trim(),
        tradeLicenseExpiry: formData.tradeLicenseExpiry,
        status: formData.status,
        bankName: formData.bankName.trim(),
        iban: formData.iban.trim(),
        accountNumber: formData.accountNumber.trim(),
        commissionRate: Number(formData.commissionRate),
        notes: formData.notes.trim(),
      });
      if (viewingVendor?.id === editingVendor.id) {
        setViewingVendor({
          ...editingVendor,
          ...formData,
          companyName: company?.name || 'ADCS Master Group',
        });
      }
    } else {
      addVendor({
        name: formData.name.trim(),
        category: formData.category,
        companyId: formData.companyId,
        companyName: company?.name || 'ADCS Master Group',
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        tradeLicenseNo: formData.tradeLicenseNo.trim(),
        tradeLicenseExpiry: formData.tradeLicenseExpiry,
        status: formData.status,
        bankName: formData.bankName.trim(),
        iban: formData.iban.trim(),
        accountNumber: formData.accountNumber.trim(),
        commissionRate: Number(formData.commissionRate),
        notes: formData.notes.trim(),
      });
    }

    setShowAddModal(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingVendorId) return;
    deleteVendor(deletingVendorId);
    if (viewingVendor?.id === deletingVendorId) {
      setViewingVendor(null);
    }
    setDeletingVendorId(null);
  };

  const displayVendors = filteredVendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || v.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || v.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const canManage = currentUser.role === 'master' || currentUser.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Vendors & External Partners</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage subcontracted typing centers, translation bureaus, medical clinics, and commission partners
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor, contact, or email..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-hidden"
            />
          </div>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Vendor Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
          >
            {VENDOR_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status:</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-white dark:bg-slate-900 font-bold shadow-xs text-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({filteredVendors.length})
            </button>
            <button
              onClick={() => setSelectedStatus('active')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedStatus === 'active'
                  ? 'bg-white dark:bg-slate-900 font-bold shadow-xs text-emerald-600'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedStatus('suspended')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                selectedStatus === 'suspended'
                  ? 'bg-white dark:bg-slate-900 font-bold shadow-xs text-rose-600'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Suspended
            </button>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayVendors.map((vendor) => {
          const linkedClients = clients.filter((c) => c.vendorId === vendor.id);
          return (
            <div
              key={vendor.id}
              onClick={() => setViewingVendor(vendor)}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      <Handshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {vendor.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {vendor.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        vendor.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {vendor.status}
                    </span>

                    {canManage && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Edit Vendor"
                          onClick={(e) => handleOpenEditModal(vendor, e)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Vendor"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingVendorId(vendor.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Contact: <strong>{vendor.contactPerson}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Branch: {vendor.companyName}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  {linkedClients.length} Associated Clients
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {vendor.commissionRate ? `${vendor.commissionRate}% Commission` : 'Contract Rate'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {displayVendors.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Handshake className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Vendors Found</h3>
          <p className="text-xs text-slate-500 mt-1">Register external partners, typing centers, and agencies.</p>
        </div>
      )}

      {/* Vendor Detail View Modal */}
      {viewingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl animate-in fade-in my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-base">
                  <Handshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewingVendor.name}</h3>
                  <p className="text-xs text-slate-500">
                    {viewingVendor.category} &bull; {viewingVendor.companyName}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingVendor(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Contact & Location</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Primary Contact:</strong> {viewingVendor.contactPerson}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Email:</strong> {viewingVendor.email}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Phone:</strong> {viewingVendor.phone}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Address:</strong> {viewingVendor.address || 'Dubai, UAE'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Compliance & Banking</h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Trade License:</strong> {viewingVendor.tradeLicenseNo || 'N/A'} (Exp: {viewingVendor.tradeLicenseExpiry || 'N/A'})
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Bank Name:</strong> {viewingVendor.bankName || 'Emirates NBD'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>IBAN:</strong> {viewingVendor.iban || 'AE000000000000000000000'}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong>Commission Rate:</strong> {viewingVendor.commissionRate || 0}%
                  </p>
                </div>
              </div>

              {/* Linked Clients */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                  Clients Affiliated with {viewingVendor.name}
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {clients
                    .filter((c) => c.vendorId === viewingVendor.id)
                    .map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setViewingVendor(null);
                          setSelectedClientId(c.id);
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between hover:border-blue-500/50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={c.avatar} alt={c.fullName} className="w-7 h-7 rounded-lg object-cover" />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{c.fullName}</span>
                            <span className="text-[10px] text-slate-400 block">{c.passportNo} &bull; {c.currentStageName}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-600">
                          AED {c.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  {clients.filter((c) => c.vendorId === viewingVendor.id).length === 0 && (
                    <p className="text-slate-400 italic text-xs">No clients currently registered under this vendor.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(viewingVendor)}
                      className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => setDeletingVendorId(viewingVendor.id)}
                      className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setViewingVendor(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingVendor ? 'Edit Vendor Profile' : 'Register New Vendor / Partner'}
                  </h2>
                  <p className="text-xs text-slate-500">Configure typing center, legal attestation, or partner contract</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor / Firm Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Al Taresh Typing & Govt Services"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Partner Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Vendor['category'] })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Typing Center">Typing Center</option>
                    <option value="Legal Translation">Legal Translation</option>
                    <option value="Embassy Attestation">Embassy Attestation</option>
                    <option value="Medical Center">Medical Center</option>
                    <option value="Insurance Provider">Insurance Provider</option>
                    <option value="Courier & Logistics">Courier & Logistics</option>
                    <option value="Real Estate & Ejari">Real Estate & Ejari</option>
                    <option value="PRO Outsourcing">PRO Outsourcing</option>
                    <option value="General Partner">General Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Assigned Company / Branch *</label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Active Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Vendor['status'] })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. info@altaresh.ae"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Trade License Number</label>
                  <input
                    type="text"
                    value={formData.tradeLicenseNo}
                    onChange={(e) => setFormData({ ...formData, tradeLicenseNo: e.target.value })}
                    placeholder="e.g. TL-849201"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Trade License Expiry</label>
                  <input
                    type="date"
                    value={formData.tradeLicenseExpiry}
                    onChange={(e) => setFormData({ ...formData, tradeLicenseExpiry: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Physical Address / Branch Location</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Ground Floor, Al Barsha Business Center, Dubai"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Emirates NBD / FAB"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">IBAN Number</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                    placeholder="AE00 0000 0000 0000 0000 00"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="1010293848"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Internal Notes & Special Agreement</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special pricing arrangements, SLA turnaround agreements, VIP contacts..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  {editingVendor ? 'Update Vendor' : 'Save Vendor Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVendorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Vendor Profile</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to delete this vendor? Existing client records will maintain historical reference data.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingVendorId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
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
