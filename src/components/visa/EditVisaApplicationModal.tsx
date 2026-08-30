import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  User,
  FileText,
  DollarSign,
  Calendar,
  Shield,
  Plane,
  Clock,
  Check,
  Building,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { VisaApplication, VisaApplicationStatus } from '../../types/crm';

interface EditVisaApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: VisaApplication | null;
}

export const EditVisaApplicationModal: React.FC<EditVisaApplicationModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  const { availableUsers, updateVisaApplication, recordAuditLog } = useCRM();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPassportNo, setClientPassportNo] = useState('');
  const [clientNationality, setClientNationality] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [countryOfApplying, setCountryOfApplying] = useState('');
  const [targetCountry, setTargetCountry] = useState('');
  const [visaType, setVisaType] = useState('');
  const [entryType, setEntryType] = useState<'Single Entry' | 'Multiple Entry'>('Single Entry');
  const [governmentFee, setGovernmentFee] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [travelDate, setTravelDate] = useState('');
  const [processingSpeed, setProcessingSpeed] = useState<'Standard' | 'Express / VIP' | 'Super Express (24h)'>('Standard');
  const [assignedOfficerName, setAssignedOfficerName] = useState('');
  const [governmentReferenceNo, setGovernmentReferenceNo] = useState('');
  const [status, setStatus] = useState<VisaApplicationStatus>('submitted');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setClientName(application.clientName || '');
      setClientEmail(application.clientEmail || '');
      setClientPhone(application.clientPhone || '');
      setClientPassportNo(application.clientPassportNo || '');
      setClientNationality(application.clientNationality || '');
      setOriginCountry(application.originCountry || application.clientNationality || '');
      setCountryOfApplying(application.countryOfApplying || 'United Arab Emirates');
      setTargetCountry(application.targetCountry || '');
      setVisaType(application.visaType || '');
      setEntryType((application.entryType as any) || 'Single Entry');
      setGovernmentFee(application.governmentFee || 0);
      setServiceFee(application.serviceFee || 0);
      setTotalAmount(application.totalAmount || (application.governmentFee + application.serviceFee) || 0);
      setTravelDate(application.travelDate || '');
      setProcessingSpeed(application.processingSpeed || 'Standard');
      setAssignedOfficerName(application.assignedOfficerName || '');
      setGovernmentReferenceNo(application.governmentReferenceNo || '');
      setStatus(application.status || 'submitted');
    }
  }, [application, isOpen]);

  if (!isOpen || !application) return null;

  const handleGovOrServiceFeeChange = (gov: number, srv: number) => {
    setGovernmentFee(gov);
    setServiceFee(srv);
    setTotalAmount(gov + srv);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    setIsSaving(true);

    const updates: Partial<VisaApplication> = {
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientPassportNo: clientPassportNo.trim(),
      clientNationality: clientNationality.trim(),
      originCountry: originCountry.trim() || undefined,
      countryOfApplying: countryOfApplying.trim() || undefined,
      targetCountry: targetCountry.trim(),
      visaType: visaType.trim(),
      entryType,
      governmentFee: Number(governmentFee) || 0,
      serviceFee: Number(serviceFee) || 0,
      totalAmount: Number(totalAmount) || 0,
      travelDate,
      processingSpeed,
      assignedOfficerName: assignedOfficerName.trim() || undefined,
      governmentReferenceNo: governmentReferenceNo.trim() || undefined,
      status,
    };

    updateVisaApplication(application.id, updates);
    recordAuditLog(
      'Visa Application Edited',
      'Services',
      `Admin/Master modified visa application details for #${application.applicationNumber} (${clientName})`
    );
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{application.targetCountryFlag || '🌍'}</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Edit Visa Application Dossier
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  #{application.applicationNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Master / Admin record modifications & fee adjustments
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
          {/* Applicant Personal Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Applicant Credentials
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Applicant Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Passport Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientPassportNo}
                  onChange={(e) => setClientPassportNo(e.target.value)}
                  className="w-full py-2 px-3 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Applicant Nationality
                </label>
                <input
                  type="text"
                  value={clientNationality}
                  onChange={(e) => setClientNationality(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Origin Country (Passport / Citizenship)
                </label>
                <input
                  type="text"
                  value={originCountry}
                  onChange={(e) => setOriginCountry(e.target.value)}
                  placeholder="e.g. India, United Kingdom, Pakistan"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Country of Applying (Current Residence / Submission Location)
                </label>
                <input
                  type="text"
                  value={countryOfApplying}
                  onChange={(e) => setCountryOfApplying(e.target.value)}
                  placeholder="e.g. United Arab Emirates, Saudi Arabia, Qatar"
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Visa Service & Target Mission */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-indigo-500" />
              Visa Package & Destination
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Country
                </label>
                <input
                  type="text"
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Visa Service Package Name
                </label>
                <input
                  type="text"
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Entry Type
                </label>
                <select
                  value={entryType}
                  onChange={(e) => setEntryType(e.target.value as any)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Single Entry">Single Entry</option>
                  <option value="Multiple Entry">Multiple Entry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Travel Date
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Processing Speed
                </label>
                <select
                  value={processingSpeed}
                  onChange={(e) => setProcessingSpeed(e.target.value as any)}
                  className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Standard">Standard</option>
                  <option value="Express / VIP">Express / VIP</option>
                  <option value="Super Express (24h)">Super Express (24h)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Fee Adjustments */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                Fee Breakdown (AED)
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                Total Payable: AED {totalAmount.toLocaleString()}
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Gov / Consular Fee (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  value={governmentFee}
                  onChange={(e) => handleGovOrServiceFeeChange(Number(e.target.value), serviceFee)}
                  className="w-full py-1.5 px-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Agency Fee (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  value={serviceFee}
                  onChange={(e) => handleGovOrServiceFeeChange(governmentFee, Number(e.target.value))}
                  className="w-full py-1.5 px-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Total Final Fee (AED)
                </label>
                <input
                  type="number"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full py-1.5 px-3 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Officer & Government Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Immigration Officer
              </label>
              <select
                value={assignedOfficerName}
                onChange={(e) => setAssignedOfficerName(e.target.value)}
                className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Unassigned</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Government Reference / Entry Permit No
              </label>
              <input
                type="text"
                value={governmentReferenceNo}
                onChange={(e) => setGovernmentReferenceNo(e.target.value)}
                placeholder="e.g. MOFA-DXB-9812984"
                className="w-full py-2 px-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
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
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Dossier...' : 'Save Dossier Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
