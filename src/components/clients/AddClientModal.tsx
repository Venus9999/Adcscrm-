import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertTriangle, CheckCircle2, ShieldAlert, Building2, Handshake, Users, Sparkles } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Client } from '../../types/crm';

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
    vendorId: '',
    referredBy: '',
    assignedAdminId: currentUser.role === 'admin' || currentUser.role === 'master' ? currentUser.id : 'user-master',
    assignedEmployeeIds: currentUser.role === 'employee' ? [currentUser.id] : [],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    tags: ['New Client'],
    initialServiceId: serviceCategories[0]?.id || '',
  });

  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Credit Card' | 'Cash' | 'Cheque' | 'Online Gateway'>('Bank Transfer');

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
      advanceAmount > 0
        ? {
            advanceAmount,
            paymentMethod,
            notes: `Initial retainer payment collected at registration`,
          }
        : undefined
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
                      {c.name}
                    </option>
                  ))}
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

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Employee
                </label>
                <select
                  value={formData.assignedEmployeeIds[0]}
                  onChange={(e) => setFormData({ ...formData, assignedEmployeeIds: [e.target.value] })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                >
                  {(users || [])
                    .filter((u) => u && (u.role === 'employee' || u.role === 'admin' || u.role === 'master'))
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.role.toUpperCase()})
                      </option>
                    ))}
                </select>
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
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Service Category</label>
              <select
                value={formData.initialServiceId}
                onChange={(e) => setFormData({ ...formData, initialServiceId: e.target.value })}
                className="w-full p-2.5 bg-white dark:bg-slate-800 rounded-xl text-xs border border-blue-200 dark:border-blue-800 font-medium"
              >
                <option value="">-- No Service (Register Client Profile Only) --</option>
                {serviceCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Professional Fee: AED {s.defaultPrice.toLocaleString()} + Gov: AED {s.governmentFees.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Financial Invoice Breakdown Preview */}
            {(() => {
              const selectedSrv = serviceCategories.find((s) => s.id === formData.initialServiceId);
              if (!selectedSrv) return null;

              const price = selectedSrv.defaultPrice;
              const gov = selectedSrv.governmentFees;
              const vat = Math.round(price * 0.05);
              const grandTotal = price + vat + gov;

              return (
                <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Invoice Amount Breakdown</span>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">Total: AED {grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500">Service Fee</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">AED {price.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] text-slate-500">VAT (5%)</p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">AED {vat.toLocaleString()}</p>
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
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700"
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Credit Card">Credit Card / POS</option>
                          <option value="Cash">Cash Voucher</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Online Gateway">Online Gateway (Stripe/Wio)</option>
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
    </div>
  );
};
