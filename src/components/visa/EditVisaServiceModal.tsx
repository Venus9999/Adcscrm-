import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  DollarSign,
  Clock,
  FileText,
  Shield,
  Plus,
  Trash2,
  Check,
  Tag,
  FileCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { VisaCountryOption } from '../../data/countriesData';

type VisaServiceType = VisaCountryOption['visaTypes'][number];

interface EditVisaServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  serviceToEdit?: VisaServiceType | null;
  onSave: (service: VisaServiceType) => void;
}

const CATEGORY_OPTIONS: VisaServiceType['category'][] = [
  'Tourist / Visit Visa',
  'Golden / Investor Visa',
  'Work / Employment Permit',
  'Business Visa',
  'Student Visa',
  'Digital Nomad',
];

const ENTRY_OPTIONS: VisaServiceType['entryType'][] = [
  'Single Entry',
  'Multiple Entry',
];

export const EditVisaServiceModal: React.FC<EditVisaServiceModalProps> = ({
  isOpen,
  onClose,
  countryCode,
  countryName,
  countryFlag,
  serviceToEdit,
  onSave,
}) => {
  const isEditing = Boolean(serviceToEdit);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<VisaServiceType['category']>('Tourist / Visit Visa');
  const [entryType, setEntryType] = useState<VisaServiceType['entryType']>('Single Entry');
  const [validityDuration, setValidityDuration] = useState('60 Days from issue');
  const [stayDuration, setStayDuration] = useState('30 Days');
  const [standardGovFee, setStandardGovFee] = useState<number>(350);
  const [standardServiceFee, setStandardServiceFee] = useState<number>(150);
  const [standardDays, setStandardDays] = useState<number>(3);
  const [expressDays, setExpressDays] = useState<number>(1);
  const [expressSurcharge, setExpressSurcharge] = useState<number>(180);
  const [superExpressAvailable, setSuperExpressAvailable] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([
    'Valid Passport Copy (6+ months validity)',
    'High-Resolution Passport Photo (White Background)',
  ]);
  const [newDocInput, setNewDocInput] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name || '');
      setCategory(serviceToEdit.category || 'Tourist / Visit Visa');
      setEntryType(serviceToEdit.entryType || 'Single Entry');
      setValidityDuration(serviceToEdit.validityDuration || '60 Days');
      setStayDuration(serviceToEdit.stayDuration || '30 Days');
      setStandardGovFee(serviceToEdit.standardGovFee ?? 350);
      setStandardServiceFee(serviceToEdit.standardServiceFee ?? 150);
      setStandardDays(serviceToEdit.standardDays ?? 3);
      setExpressDays(serviceToEdit.expressDays ?? 1);
      setExpressSurcharge(serviceToEdit.expressSurcharge ?? 180);
      setSuperExpressAvailable(Boolean(serviceToEdit.superExpressAvailable));
      setDescription(serviceToEdit.description || '');
      setRequiredDocuments(serviceToEdit.requiredDocuments || []);
    } else {
      setName('');
      setCategory('Tourist / Visit Visa');
      setEntryType('Single Entry');
      setValidityDuration('60 Days from issue');
      setStayDuration('30 Days');
      setStandardGovFee(350);
      setStandardServiceFee(150);
      setStandardDays(3);
      setExpressDays(1);
      setExpressSurcharge(180);
      setSuperExpressAvailable(true);
      setDescription('');
      setRequiredDocuments([
        'Valid Passport Copy (6+ months validity)',
        'High-Resolution Passport Photo (White Background)',
      ]);
    }
    setNewDocInput('');
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddDoc = () => {
    const trimmed = newDocInput.trim();
    if (!trimmed) return;
    if (!requiredDocuments.includes(trimmed)) {
      setRequiredDocuments([...requiredDocuments, trimmed]);
    }
    setNewDocInput('');
  };

  const handleRemoveDoc = (index: number) => {
    setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const serviceId = serviceToEdit?.id || `${countryCode.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${Date.now().toString().slice(-4)}`;

    const savedService: VisaServiceType = {
      id: serviceId,
      name: name.trim(),
      category,
      entryType,
      validityDuration: validityDuration.trim() || '60 Days',
      stayDuration: stayDuration.trim() || '30 Days',
      standardGovFee: Number(standardGovFee) || 0,
      standardServiceFee: Number(standardServiceFee) || 0,
      standardDays: Number(standardDays) || 1,
      expressDays: Number(expressDays) || 1,
      expressSurcharge: Number(expressSurcharge) || 0,
      superExpressAvailable,
      requiredDocuments: requiredDocuments.length > 0 ? requiredDocuments : ['Valid Passport Copy'],
      description: description.trim(),
    };

    onSave(savedService);
    onClose();
  };

  const totalFee = (Number(standardGovFee) || 0) + (Number(standardServiceFee) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{countryFlag}</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isEditing ? 'Edit Visa Service Package' : 'Create New Visa Service'}
                <span className="px-2 py-0.5 text-xs font-mono font-normal rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {countryCode.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Destination: <span className="font-semibold text-slate-700 dark:text-slate-300">{countryName}</span> (Full admin & master pricing controls)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Service Name & Category */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Visa Service Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 30 Days Tourist / Visit Visa, Golden Residency Permit, Schengen C-Type..."
                className="w-full py-2.5 px-3 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Visa Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full py-2.5 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Entry Type
                </label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value as any)}
                  className="w-full py-2.5 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {ENTRY_OPTIONS.map((ent) => (
                    <option key={ent} value={ent}>
                      {ent}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Validity Duration
                </label>
                <input
                  type="text"
                  value={validityDuration}
                  onChange={(e) => setValidityDuration(e.target.value)}
                  placeholder="e.g. 60 Days from issue, 1 Year, 10 Years"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Max Stay Duration
                </label>
                <input
                  type="text"
                  value={stayDuration}
                  onChange={(e) => setStayDuration(e.target.value)}
                  placeholder="e.g. 30 Days, 90 Days, Continuous"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Fees Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Government & Agency Fee Schedule (AED)
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                Total Standard Fee: AED {totalFee.toLocaleString()}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Government / Consular Fee (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  value={standardGovFee}
                  onChange={(e) => setStandardGovFee(Number(e.target.value))}
                  className="w-full py-2 px-3 text-xs font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Agency / Service Fee (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  value={standardServiceFee}
                  onChange={(e) => setStandardServiceFee(Number(e.target.value))}
                  className="w-full py-2 px-3 text-xs font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Standard Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={standardDays}
                  onChange={(e) => setStandardDays(Number(e.target.value))}
                  className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Express Days
                </label>
                <input
                  type="number"
                  min="1"
                  value={expressDays}
                  onChange={(e) => setExpressDays(Number(e.target.value))}
                  className="w-full py-1.5 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Express Surcharge (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  value={expressSurcharge}
                  onChange={(e) => setExpressSurcharge(Number(e.target.value))}
                  className="w-full py-1.5 px-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <input
                type="checkbox"
                id="superExpressToggle"
                checked={superExpressAvailable}
                onChange={(e) => setSuperExpressAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="superExpressToggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enable 24-Hour VIP Super Express Track
              </label>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Required Documents Checklist ({requiredDocuments.length})
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDocInput}
                onChange={(e) => setNewDocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDoc();
                  }
                }}
                placeholder="Type required document (e.g. NOC, 6-Month Bank Statement, Flight Ticket)..."
                className="flex-1 py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {requiredDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs"
                >
                  <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    {doc}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description & Consular Guidelines */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Service Description & Consulate Processing Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Official tourist visa for individuals seeking leisure travel, short business visits, or family meetings..."
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Save Changes to Service' : 'Create Worldwide Service'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
