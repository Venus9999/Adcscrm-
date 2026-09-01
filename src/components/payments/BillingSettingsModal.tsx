import React, { useState } from 'react';
import {
  Building2,
  Receipt,
  FileCheck,
  Upload,
  Image,
  RotateCcw,
  CheckCircle2,
  X,
  CreditCard,
  Percent,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { InvoiceBillingSettings } from '../../types/crm';

interface BillingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillingSettingsModal: React.FC<BillingSettingsModalProps> = ({ isOpen, onClose }) => {
  const { billingSettings, updateBillingSettings, resetBillingSettingsToDefault } = useCRM();
  const [activeTab, setActiveTab] = useState<'company' | 'bank' | 'nomod' | 'signatory' | 'policy'>('company');
  const [formData, setFormData] = useState<InvoiceBillingSettings>({ ...billingSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (
    field: 'signatorySignatureUrl' | 'companyStampUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({
          ...prev,
          [field]: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const generateSampleStamp = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 240, 240);

    // Outer circle
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(120, 120, 105, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner circle
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(120, 120, 95, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner dotted circle
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#2563EB';
    ctx.beginPath();
    ctx.arc(120, 120, 78, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Text in center
    ctx.fillStyle = '#1E40AF';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const companyShort = (formData.companyName || 'ADCS CLEARING').toUpperCase().slice(0, 20);
    ctx.fillText(companyShort, 120, 85);

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#DC2626';
    ctx.fillText('★ APPROVED ★', 120, 115);

    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#1E3A8A';
    ctx.fillText(`TRN: ${formData.trn || '10048291000003'}`, 120, 140);
    ctx.fillText('DUBAI - UAE', 120, 155);

    const base64Stamp = canvas.toDataURL('image/png');
    setFormData((prev) => ({
      ...prev,
      companyStampUrl: base64Stamp,
      showStampOnInvoice: true,
    }));
  };

  const generateSampleSignature = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 280, 100);
    ctx.strokeStyle = '#1E40AF';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(30, 60);
    ctx.bezierCurveTo(50, 20, 70, 80, 90, 45);
    ctx.bezierCurveTo(110, 20, 130, 70, 160, 40);
    ctx.bezierCurveTo(180, 30, 200, 60, 240, 45);
    ctx.stroke();

    // Underline
    ctx.beginPath();
    ctx.moveTo(25, 75);
    ctx.lineTo(250, 70);
    ctx.stroke();

    const base64Sig = canvas.toDataURL('image/png');
    setFormData((prev) => ({
      ...prev,
      signatorySignatureUrl: base64Sig,
      showSignatureOnInvoice: true,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBillingSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all invoice and billing settings to default values?')) {
      resetBillingSettingsToDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl p-6 sm:p-7 animate-in fade-in my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Invoice & Billing Settings
              </h3>
              <p className="text-xs text-slate-500">
                Company Details, VAT TRN, Bank Wire, Authorized Signatory & Official Stamp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 pt-3 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'company'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company & TRN</span>
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bank'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Bank Settlement</span>
          </button>

          <button
            onClick={() => setActiveTab('nomod')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'nomod'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Nomod Checkout API</span>
          </button>

          <button
            onClick={() => setActiveTab('signatory')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'signatory'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Signatory & Stamp</span>
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'policy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>VAT & Policies</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-1">
          {/* Tab 1: Company & TRN */}
          {activeTab === 'company' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Legal Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Trading Name / Brand Line
                  </label>
                  <input
                    type="text"
                    value={formData.tradingName}
                    onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    VAT TRN Number (15 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.trn}
                    onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                    placeholder="10048291000003"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Trade License Number
                  </label>
                  <input
                    type="text"
                    value={formData.tradeLicenseNo}
                    onChange={(e) => setFormData({ ...formData, tradeLicenseNo: e.target.value })}
                    placeholder="TL-89421"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Address Line 1
                </label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Business Bay Tower, Floor 14"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    City / Emirate
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    P.O. Box
                  </label>
                  <input
                    type="text"
                    value={formData.poBox}
                    onChange={(e) => setFormData({ ...formData, poBox: e.target.value })}
                    placeholder="89211"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 4 800 2739"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Billing / Finance Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="finance@adcs.ae"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Website
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.adcs.ae"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Bank Settlement Details */}
          {activeTab === 'bank' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
                These bank wire settlement details will appear automatically in the footer of all client tax invoices and official vouchers.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="Emirates NBD PJSC"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankBranch}
                    onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                    placeholder="Business Bay Corporate Branch"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Beneficiary Account Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="ADCS Document Clearing LLC"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="1019283746501"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    value={formData.swiftCode}
                    onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                    placeholder="EBILAEADXXX"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  IBAN Number (23 Characters) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  placeholder="AE44 0260 0001 2345 6789 012"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Tab: Nomod Online Payment Gateway */}
          {activeTab === 'nomod' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-blue-950 dark:text-blue-100 font-bold">
                      {formData.nomodEnabled && formData.nomodApiKey ? 'Nomod Live Gateway Active' : 'Nomod Gateway Disconnected'}
                    </strong>
                    Accept instant direct card payments (Visa, Mastercard, Apple Pay, Google Pay, UAE Jaywan Debit) with automated invoice settlement.
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                  formData.nomodEnabled && formData.nomodApiKey
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {formData.nomodEnabled && formData.nomodApiKey ? 'Active' : 'Offline'}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nomod Live Secret API Key (Bearer Token)
                  </label>
                  <div className="flex items-center gap-2">
                    {formData.nomodApiKey ? (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            nomodApiKey: '',
                            nomodEnabled: false,
                          });
                        }}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                      >
                        Disconnect / Logout from Nomod
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            nomodApiKey: 'sk_live_3IVlZ54J.kLVItZdIN1Xlvi2ybkMPU6Fv6K13UhvY',
                            nomodEnabled: true,
                          });
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                      >
                        Use Demo Credentials
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.nomodApiKey ?? ''}
                    onChange={(e) => setFormData({ ...formData, nomodApiKey: e.target.value })}
                    placeholder="sk_live_..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-semibold"
                  />
                  <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                    {formData.nomodApiKey ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        Connected
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        Not Set
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Used by server-side endpoints to initiate live checkout links and verify settlements.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Settlement Currency
                  </label>
                  <select
                    value={formData.nomodCurrencyDefault || 'AED'}
                    onChange={(e) => setFormData({ ...formData, nomodCurrencyDefault: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="AED">AED (UAE Dirham)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="SAR">SAR (Saudi Riyal)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="GBP">GBP (British Pound)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gateway Status
                  </label>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-semibold">Enable Live Checkout</span>
                    <input
                      type="checkbox"
                      checked={formData.nomodEnabled ?? true}
                      onChange={(e) => setFormData({ ...formData, nomodEnabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Authorized Signatory & Stamp */}
          {activeTab === 'signatory' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                Authorized Signatory & Stamp are settled by <strong>Admin & Master Panel</strong> and will appear dynamically on printed tax invoices and client vouchers.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Authorized Signatory Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authorizedSignatoryName}
                    onChange={(e) => setFormData({ ...formData, authorizedSignatoryName: e.target.value })}
                    placeholder="e.g. Tariq Al Mansoori"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Signatory Role / Designation
                  </label>
                  <input
                    type="text"
                    value={formData.authorizedSignatoryTitle}
                    onChange={(e) => setFormData({ ...formData, authorizedSignatoryTitle: e.target.value })}
                    placeholder="Managing Partner & Authorized Signatory"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Uploads Grid */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Stamp Section */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Official Company Stamp
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showStampOnInvoice}
                        onChange={(e) => setFormData({ ...formData, showStampOnInvoice: e.target.checked })}
                        className="rounded"
                      />
                      <span>Show on Invoice</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[90px]">
                    {formData.companyStampUrl ? (
                      <div className="relative group">
                        <img
                          src={formData.companyStampUrl}
                          alt="Official Stamp"
                          className="h-20 w-20 object-contain mx-auto transform -rotate-6"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, companyStampUrl: '' })}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-xs hover:bg-rose-700"
                          title="Remove Stamp"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 text-center">
                        No stamp uploaded
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <label className="flex-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-[11px] font-bold text-center cursor-pointer flex items-center justify-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Stamp</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('companyStampUrl', e)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={generateSampleStamp}
                      className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      title="Generate Official Circular Stamp"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Signatory Signature
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showSignatureOnInvoice}
                        onChange={(e) => setFormData({ ...formData, showSignatureOnInvoice: e.target.checked })}
                        className="rounded"
                      />
                      <span>Show on Invoice</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[90px]">
                    {formData.signatorySignatureUrl ? (
                      <div className="relative group">
                        <img
                          src={formData.signatorySignatureUrl}
                          alt="Signature"
                          className="h-16 w-36 object-contain mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, signatorySignatureUrl: '' })}
                          className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-xs hover:bg-rose-700"
                          title="Remove Signature"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 text-center">
                        No signature uploaded
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <label className="flex-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-[11px] font-bold text-center cursor-pointer flex items-center justify-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload Signature</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('signatorySignatureUrl', e)}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={generateSampleSignature}
                      className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                      title="Generate Digital Signature"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: VAT & Policies */}
          {activeTab === 'policy' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Standard UAE VAT Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.vatRate}
                    onChange={(e) => setFormData({ ...formData, vatRate: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Default Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Terms & Conditions (Printed on Invoices)
                </label>
                <textarea
                  rows={3}
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Footer Compliance Notice
                </label>
                <textarea
                  rows={2}
                  value={formData.footerNotes}
                  onChange={(e) => setFormData({ ...formData, footerNotes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Billing Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
