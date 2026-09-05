import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertTriangle, CheckCircle2, ShieldAlert, Building2, Handshake, Users, Sparkles, Plus } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Client, ServiceCategory } from '../../types/crm';
import { QuickCreateServiceModal } from '../services/QuickCreateServiceModal';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  const {
    companies,
    vendors,
    users,
    serviceCategories,
    addClient,
    checkDuplicateClient,
    selectedCompanyId,
    currentUser,
  } = useCRM();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationality: 'United Arab Emirates',
    dob: '1990-01-01',
    gender: 'Male' as Client['gender'],
    passportNo: '',
    passportExpiry: '2030-01-01',
    emiratesId: '',
    emiratesIdExpiry: '2028-01-01',
    visaUid: '',
    visaType: 'Employment Residence Visa',
    visaExpiry: '2028-01-01',
    mobile: '+971 50 ',
    whatsapp: '+971 50 ',
    email: '',
    residentialAddress: '',
    companyId: selectedCompanyId !== 'all' ? selectedCompanyId : companies[0]?.id || 'comp-1',
    pricingTier: 'b2b' as 'b2b' | 'b2c',
    corporateDiscountPercent: 15,
    vendorId: '',
    referredBy: '',
    assignedAdminId: currentUser.role === 'admin' || currentUser.role === 'master' ? currentUser.id : 'user-master',
    assignedEmployeeIds: currentUser.role === 'employee' ? [currentUser.id] : [],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    tags: ['New Client'],
    initialServiceId: serviceCategories[0]?.id || '',
  });

  // When company selection changes, synchronize default discount
  useEffect(() => {
    const targetComp = companies.find((c) => c.id === formData.companyId);
    if (targetComp) {
      setFormData((prev) => ({
        ...prev,
        corporateDiscountPercent: targetComp.corporateDiscountPercent ?? 15,
      }));
    }
  }, [formData.companyId, companies]);

  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque' | 'Online Gateway' | 'Nomod'>('Nomod');
  const [vatRate, setVatRate] = useState<number>(0);

  const [showQuickCreateService, setShowQuickCreateService] = useState(false);

  const handleServiceCreated = (newService: ServiceCategory) => {
    setFormData((prev) => ({
      ...prev,
      initialServiceId: newService.id,
    }));
  };

  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; fields: string[]; existingName?: string }>({
    isDuplicate: false,
    fields: [],
  });

  // Real-time Duplicate Check
  useEffect(() => {
    if (formData.passportNo || formData.emiratesId || formData.mobile.length > 8 || formData.email) {
      const res = checkDuplicateClient({
        passportNo: formData.passportNo,
        emiratesId: formData.emiratesId,
        mobile: formData.mobile,
        email: formData.email,
      });

      setDuplicateWarning({
        isDuplicate: res.isDuplicate,
        fields: res.duplicateFields,
        existingName: res.existingClient?.fullName,
      });
    } else {
      setDuplicateWarning({ isDuplicate: false, fields: [] });
    }
  }, [formData.passportNo, formData.emiratesId, formData.mobile, formData.email, checkDuplicateClient]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

    const selectedVendor = vendors.find((v) => v.id === formData.vendorId);

    const res = addClient(
      {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        fullName,
        nationality: formData.nationality,
        dob: formData.dob,
        gender: formData.gender,
        passportNo: formData.passportNo.trim().toUpperCase(),
        passportExpiry: formData.passportExpiry,
        emiratesId: formData.emiratesId.trim(),
        emiratesIdExpiry: formData.emiratesIdExpiry,
        visaUid: formData.visaUid.trim() || undefined,
        visaType: formData.visaType || undefined,
        visaExpiry: formData.visaExpiry || undefined,
        mobile: formData.mobile.trim(),
        whatsapp: formData.whatsapp.trim() || formData.mobile.trim(),
        email: formData.email.trim(),
        residentialAddress: formData.residentialAddress.trim(),
        companyId: formData.companyId,
        pricingTier: formData.pricingTier,
        corporateDiscountPercent: formData.pricingTier === 'b2b' ? formData.corporateDiscountPercent : undefined,
        vendorId: formData.vendorId || undefined,
        vendorName: selectedVendor ? selectedVendor.name : undefined,
        referredBy: formData.referredBy.trim() || undefined,
        assignedAdminId: formData.assignedAdminId,
        assignedEmployeeIds: formData.assignedEmployeeIds,
        currentStageId: 'stage-1',
        currentStageName: 'New Inquiry',
        paymentStatus: 'unpaid',
        totalAmount: 0,
        paidAmount: 0,
        outstandingAmount: 0,
        avatar: formData.avatar,
        tags: formData.tags,
      },
      formData.initialServiceId,
      {
        advanceAmount: advanceAmount > 0 ? advanceAmount : 0,
        paymentMethod,
        notes: advanceAmount > 0 ? `Initial retainer payment collected at registration` : undefined,
        vatRate,
      }
    );

    if (res.success) {
      onClose();
    } else {
      alert(res.error || 'Failed to create client.');
    }
  };

  const branchEmployees = (users || []).filter((u) => u && u.companyId === formData.companyId && u.role === 'employee');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Register New Client</h2>
              <p className="text-xs text-slate-500">Create client digital profile with company, vendor affiliation, and referral source</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Duplicate Prevention Alert Banner */}
          {duplicateWarning.isDuplicate && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Duplicate Client Record Detected!
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                  An existing client profile (<strong>{duplicateWarning.existingName}</strong>) already matches on:{' '}
                  <span className="font-semibold">{duplicateWarning.fields.join(', ')}</span>.
                </p>
              </div>
            </div>
          )}

          {/* Company Branch, Vendor Partner, and Referral Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>Corporate Entity & Partnership Affiliation</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Company / Branch *
                </label>
                <select
                  required
                  value={formData.companyId}
                  onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.corporateDiscountPercent ?? 15}% Discount)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pricing Tier *
                </label>
                <select
                  value={formData.pricingTier}
                  onChange={(e) => setFormData({ ...formData, pricingTier: e.target.value as 'b2b' | 'b2c' })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold text-blue-600 dark:text-blue-400"
                >
                  <option value="b2b">🏢 Corporate (B2B Discounted)</option>
                  <option value="b2c">👤 Individual (B2C Direct Rate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Handshake className="w-3 h-3 text-indigo-500" />
                  <span>Vendor / Partner</span>
                </label>
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                >
                  <option value="">-- Direct / No Vendor --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Referred By
                </label>
                <input
                  type="text"
                  value={formData.referredBy}
                  onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                  placeholder="e.g. Agent John / Client Ref / Expo"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              {formData.pricingTier === 'b2b' && (
                <div className="sm:col-span-2 lg:col-span-4 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                      B2B Discount Enabled
                    </span>
                    <span className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                      Applied to this client&apos;s service fees automatically
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Corporate Discount %:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.corporateDiscountPercent}
                      onChange={(e) => setFormData({ ...formData, corporateDiscountPercent: Number(e.target.value) || 0 })}
                      className="w-16 p-1 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold font-mono text-center border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                </div>
              )}

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Assigned Staff / PRO Specialists & Agents
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {formData.assignedEmployeeIds.length} Selected
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Assign one or multiple employees/agents to collaborate on this client dossier:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                    {(users || [])
                      .filter((u) => u && (u.role === 'employee' || u.role === 'agent' || u.role === 'admin' || u.role === 'master'))
                      .map((u) => {
                        const isSelected = formData.assignedEmployeeIds.includes(u.id);
                        return (
                          <button
                            type="button"
                            key={u.id}
                            onClick={() => {
                              if (isSelected) {
                                setFormData({
                                  ...formData,
                                  assignedEmployeeIds: formData.assignedEmployeeIds.filter((id) => id !== u.id),
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedEmployeeIds: [...formData.assignedEmployeeIds, u.id],
                                });
                              }
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs truncate">{u.name}</p>
                              <span className="text-[10px] text-slate-400 capitalize">{u.role}</span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Identity & Personal Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Personal & Identity Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Marcus"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Sterling"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nationality *</label>
                <input
                  type="text"
                  required
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  placeholder="e.g. United Kingdom"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Client['gender'] })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. marcus@example.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+971 50 123 4567"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+971 50 123 4567"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          {/* Passport & Emirates ID Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Government IDs & Passport Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Passport Number *</label>
                <input
                  type="text"
                  required
                  value={formData.passportNo}
                  onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                  placeholder="e.g. GB94827104"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Passport Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={formData.passportExpiry}
                  onChange={(e) => setFormData({ ...formData, passportExpiry: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Emirates ID (784-XXXX-XXXXXXX-X)</label>
                <input
                  type="text"
                  value={formData.emiratesId}
                  onChange={(e) => setFormData({ ...formData, emiratesId: e.target.value })}
                  placeholder="784-1990-1234567-1"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Emirates ID Expiry Date</label>
                <input
                  type="date"
                  value={formData.emiratesIdExpiry}
                  onChange={(e) => setFormData({ ...formData, emiratesIdExpiry: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Initial Service Registration & Automated Invoicing */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Service Selection & Automated Invoicing</h3>
                  <p className="text-[11px] text-slate-500">Official Tax Invoice is automatically generated and linked to this client dossier</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                Auto-Invoice Active
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Select Service Category
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuickCreateService(true)}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Not found? Create New Service</span>
                </button>
              </div>
              <select
                value={formData.initialServiceId}
                onChange={(e) => {
                  if (e.target.value === '__create_new__') {
                    setShowQuickCreateService(true);
                    return;
                  }
                  setFormData({ ...formData, initialServiceId: e.target.value });
                }}
                className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-blue-200 dark:border-blue-800 font-medium"
              >
                <option value="">-- No Service (Register Client Profile Only) --</option>
                {serviceCategories.map((s) => {
                  const b2cRate = s.priceB2C ?? s.defaultPrice;
                  const b2bRate = s.priceB2B ?? Math.round(b2cRate * (1 - (formData.corporateDiscountPercent / 100)));
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formData.pricingTier === 'b2b' ? `B2B Rate: AED ${b2bRate.toLocaleString()}` : `B2C Rate: AED ${b2cRate.toLocaleString()}`} + Gov: AED {s.governmentFees.toLocaleString()}
                    </option>
                  );
                })}
                <option value="__create_new__" className="font-bold text-blue-600">
                  + Not found? Create New Service in Catalog...
                </option>
              </select>
            </div>

            {/* Financial Invoice Breakdown Preview */}
            {(() => {
              const selectedSrv = serviceCategories.find((s) => s.id === formData.initialServiceId);
              if (!selectedSrv) return null;

              const isB2B = formData.pricingTier === 'b2b';
              const b2cBasePrice = selectedSrv.priceB2C ?? selectedSrv.defaultPrice ?? 0;
              const discPercent = formData.corporateDiscountPercent ?? 15;

              let finalPrice = b2cBasePrice;
              let discountAmount = 0;

              if (isB2B) {
                if (selectedSrv.priceB2B !== undefined && selectedSrv.priceB2B > 0) {
                  finalPrice = selectedSrv.priceB2B;
                  discountAmount = Math.max(0, b2cBasePrice - selectedSrv.priceB2B);
                } else {
                  discountAmount = Math.round(b2cBasePrice * (discPercent / 100));
                  finalPrice = Math.max(0, b2cBasePrice - discountAmount);
                }
              }

              const gov = selectedSrv.governmentFees;
              const vat = vatRate > 0 ? Math.round((finalPrice * vatRate) / 100) : 0;
              const grandTotal = finalPrice + vat + gov;

              return (
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invoice Amount Breakdown</span>
                      {isB2B && discountAmount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          B2B Corporate Discount (-AED {discountAmount.toLocaleString()})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-semibold">VAT:</span>
                        <button
                          type="button"
                          onClick={() => setVatRate(0)}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                            vatRate === 0
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          0% Exempt
                        </button>
                        <button
                          type="button"
                          onClick={() => setVatRate(5)}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded border transition-colors cursor-pointer ${
                            vatRate === 5
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          5% Standard
                        </button>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Total: AED {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500">{isB2B ? 'B2B Service Fee' : 'B2C Service Fee'}</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        AED {finalPrice.toLocaleString()}
                        {isB2B && discountAmount > 0 && (
                          <span className="block text-[9px] text-slate-400 line-through">AED {b2cBasePrice.toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500">VAT ({vatRate}%)</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        AED {vat.toLocaleString()} {vatRate === 0 ? '(0% Exempt)' : ''}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500">Gov Clearance</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">AED {gov.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Initial Retainer Payment Input */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Initial Retainer / Advance Payment Collected (Optional)</label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAdvanceAmount(0)}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        >
                          AED 0
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdvanceAmount(Math.round(grandTotal * 0.5))}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdvanceAmount(grandTotal)}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                        >
                          100%
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          min="0"
                          max={grandTotal}
                          value={advanceAmount}
                          onChange={(e) => setAdvanceAmount(Number(e.target.value) || 0)}
                          placeholder="Amount in AED"
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-semibold text-blue-600 dark:text-blue-400"
                        >
                          <option value="Nomod">Nomod Live Gateway</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      ✨ A Tax Invoice (with unique voucher ID) and transaction ledger receipt will be automatically generated and linked across the CRM.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={duplicateWarning.isDuplicate}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-colors flex items-center gap-2 cursor-pointer ${
                duplicateWarning.isDuplicate
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Client Dossier</span>
            </button>
          </div>
        </form>
      </div>

      {showQuickCreateService && (
        <QuickCreateServiceModal
          isOpen={showQuickCreateService}
          onClose={() => setShowQuickCreateService(false)}
          onCreated={handleServiceCreated}
        />
      )}
    </div>
  );
};
