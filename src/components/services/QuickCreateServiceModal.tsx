import React, { useState, useMemo } from 'react';
import {
  X,
  Briefcase,
  Plus,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Clock,
  FileCheck2,
  Tag,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ServiceCategory } from '../../types/crm';

interface QuickCreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newService: ServiceCategory) => void;
  initialName?: string;
  initialCategory?: string;
}

const COMMON_CATEGORIES = [
  'PRO Services',
  'Visa Processing',
  'Business Setup',
  'Document Clearing',
  'Attestation',
  'Legal & Compliance',
  'Tax Advisory & VAT',
  'Recruitment',
  'Translation',
];

const PRESET_DOCUMENTS = [
  'Passport Copy',
  'Emirates ID Copy',
  'Trade License',
  'Memorandum of Association (MOA)',
  'Tenancy Contract / Ejari',
  'Bank Statement (6 Months)',
  'Attested Degree / Diploma',
  'Personal Photograph',
  'Salary Certificate',
];

export const QuickCreateServiceModal: React.FC<QuickCreateServiceModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  initialName = '',
  initialCategory = 'PRO Services',
}) => {
  const { addServiceCategory, serviceCategories, serviceClassifications } = useCRM();

  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState(initialCategory);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [defaultPrice, setDefaultPrice] = useState<number>(3500);
  const [governmentFees, setGovernmentFees] = useState<number>(1500);
  const [estimatedDays, setEstimatedDays] = useState<number>(7);
  const [description, setDescription] = useState('');
  const [pricingTierAvailable, setPricingTierAvailable] = useState<'all' | 'b2b_only' | 'b2c_only'>('all');
  const [selectedDocs, setSelectedDocs] = useState<string[]>([
    'Passport Copy',
    'Emirates ID Copy',
  ]);
  const [customDocInput, setCustomDocInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available categories list
  const existingCategories = useMemo(() => {
    const set = new Set<string>(COMMON_CATEGORIES);
    (serviceClassifications || []).forEach((c) => c?.name && set.add(c.name));
    (serviceCategories || []).forEach((s) => s?.category && set.add(s.category));
    return Array.from(set);
  }, [serviceClassifications, serviceCategories]);

  // Price calculations - Non-mandatory VAT (defaults to 0% exempt, optional 5%)
  const [vatRate, setVatRate] = useState<number>(0);
  const vatAmount = vatRate > 0 ? Math.round((defaultPrice * vatRate) / 100) : 0;
  const totalAmount = defaultPrice + vatAmount + governmentFees;

  if (!isOpen) return null;

  const toggleDoc = (doc: string) => {
    if (selectedDocs.includes(doc)) {
      setSelectedDocs(selectedDocs.filter((d) => d !== doc));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDocInput.trim()) return;
    if (!selectedDocs.includes(customDocInput.trim())) {
      setSelectedDocs([...selectedDocs, customDocInput.trim()]);
    }
    setCustomDocInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Service Name is required');
      return;
    }

    const finalCategory = isCustomCat ? customCategory.trim() || 'PRO Services' : category;

    // Generate code
    const words = name.trim().toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/);
    const codePrefix = words.map((w) => w[0]).join('').substring(0, 4) || 'SRV';
    const randNum = Math.floor(100 + Math.random() * 900);
    const code = `${codePrefix}-${randNum}`;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newService = addServiceCategory({
        name: name.trim(),
        code,
        category: finalCategory,
        defaultPrice: Number(defaultPrice) || 0,
        priceB2C: Number(defaultPrice) || 0,
        priceB2B: Math.round((Number(defaultPrice) || 0) * 0.85),
        b2bDiscountPercent: 15,
        pricingTierAvailable,
        governmentFees: Number(governmentFees) || 0,
        estimatedDays: Number(estimatedDays) || 5,
        description: description.trim() || `${name.trim()} - Corporate & Government Clearance Service`,
        requiredDocuments: selectedDocs,
        defaultStages: [
          'Initial Consultation & Review',
          'Document Verification & Processing',
          'Government Authority Clearance',
          'Final Approval & Issuance',
        ],
        isActive: true,
      });

      onCreated(newService);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create service category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Add New Service to Catalog</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  Instant Registration
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register a new professional service to immediately use in leads, dossiers, and invoices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Service Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 10-Year Golden Visa (Real Estate Investor), LLC Trade License Setup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Category Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Service Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCat(!isCustomCat)}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {isCustomCat ? 'Select Existing' : '+ Type New Category'}
                </button>
              </div>
              {isCustomCat ? (
                <input
                  type="text"
                  placeholder="e.g. Media Zone Clearance"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pricing Tier Availability
              </label>
              <select
                value={pricingTierAvailable}
                onChange={(e) => setPricingTierAvailable(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Clients (B2C Individual & B2B Corporate)</option>
                <option value="b2c_only">B2C Retail / Individual Only</option>
                <option value="b2b_only">B2B Corporate Clients Only</option>
              </select>
            </div>
          </div>

          {/* Pricing & Government Fees */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Professional / Agency Fee (AED) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={defaultPrice}
                  onChange={(e) => setDefaultPrice(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gov / Authority Fees (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={governmentFees}
                  onChange={(e) => setGovernmentFees(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target SLA (Working Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Live Pricing Breakdown & Non-Mandatory VAT */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  UAE VAT Option (Optional / Non-Mandatory)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVatRate(0)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
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
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                      vatRate === 5
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    5% Standard
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span>Agency: <b>AED {defaultPrice.toLocaleString()}</b></span>
                  <span>+</span>
                  <span>Gov: <b>AED {governmentFees.toLocaleString()}</b></span>
                  <span>+</span>
                  <span>VAT ({vatRate}%): <b>AED {vatAmount.toLocaleString()}</b> {vatRate === 0 ? '(0% Exempt)' : ''}</span>
                </div>
                <div className="font-bold text-xs text-blue-600 dark:text-blue-400 font-mono">
                  Total Estimate: AED {totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service Description & Scope
            </label>
            <textarea
              rows={2}
              placeholder="Brief overview of the clearance scope, government entities involved, and deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Required Documents Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Required Client Documents ({selectedDocs.length} selected)</span>
              <span className="text-[10px] text-slate-400 font-normal">Click to toggle requirements</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
              {PRESET_DOCUMENTS.map((doc) => {
                const isSelected = selectedDocs.includes(doc);
                return (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => toggleDoc(doc)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                    <span>{doc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom doc input */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Add custom required document..."
                value={customDocInput}
                onChange={(e) => setCustomDocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomDoc(e);
                  }
                }}
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomDoc}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Doc</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Registering...' : 'Save & Select Service'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
