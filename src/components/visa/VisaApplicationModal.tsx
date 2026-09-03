import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Globe,
  CheckCircle2,
  FileText,
  Upload,
  Calendar,
  Clock,
  DollarSign,
  Shield,
  Plane,
  ChevronRight,
  Sparkles,
  Info,
  CreditCard,
  Building,
  Check,
  Zap,
  Camera,
  ChevronDown,
  ChevronUp,
  Lock,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { VisaCountryOption } from '../../data/countriesData';
import { VisaUploadedDoc } from '../../types/crm';
import { NomodCheckoutModal } from '../payment/NomodCheckoutModal';
import { AIVisaCountryAdvisor } from './AIVisaCountryAdvisor';
import { CountryFlag } from './CountryFlag';
import { VisaDocumentUploadSection, UploadDocItem } from './VisaDocumentUploadSection';

type CountryVisaType = VisaCountryOption['visaTypes'][number];

interface VisaApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCountryCode?: string;
  preSelectedClientId?: string;
}

export const VisaApplicationModal: React.FC<VisaApplicationModalProps> = ({
  isOpen,
  onClose,
  preSelectedCountryCode,
  preSelectedClientId,
}) => {
  const {
    currentUser,
    clients,
    applyForVisaService,
    confirmNomodPayment,
    companies,
    selectedCompanyId,
    visaCountryCatalog,
  } = useCRM();

  // Wizard Step: 1. Select Country & Visa Type -> 2. Applicant Details -> 3. Documents -> 4. Review & Payment
  const [step, setStep] = useState<number>(1);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Country & Visa Selection
  const [selectedCountry, setSelectedCountry] = useState<VisaCountryOption | null>(() => {
    const list = visaCountryCatalog || [];
    if (preSelectedCountryCode) {
      return (
        list.find(
          (c) =>
            c &&
            c.countryCode &&
            c.countryCode.toLowerCase().trim() === preSelectedCountryCode.toLowerCase().trim()
        ) ||
        list[0] ||
        null
      );
    }
    return list[0] || null;
  });

  const [selectedVisaType, setSelectedVisaType] = useState<CountryVisaType | null>(() => {
    const list = visaCountryCatalog || [];
    const initialCountry = preSelectedCountryCode
      ? list.find(
          (c) =>
            c &&
            c.countryCode &&
            c.countryCode.toLowerCase().trim() === preSelectedCountryCode.toLowerCase().trim()
        ) || list[0]
      : list[0];
    return initialCountry?.visaTypes?.[0] || null;
  });

  const [processingSpeed, setProcessingSpeed] = useState<'Standard' | 'Express / VIP' | 'Super Express (24h)'>('Standard');
  const [vatRate, setVatRate] = useState<number>(0);

  // Applicant Details State
  const isClientUser = currentUser.role === 'client';
  const defaultClient = useMemo(() => {
    if (preSelectedClientId) return clients.find((c) => c && c.id === preSelectedClientId);
    if (isClientUser) {
      return (
        clients.find(
          (c) =>
            c &&
            c.email &&
            currentUser.email &&
            c.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
        ) ||
        clients.find((c) => c && c.id === currentUser.id) ||
        clients[0]
      );
    }
    return clients[0];
  }, [preSelectedClientId, isClientUser, currentUser, clients]);

  const [selectedClientIdState, setSelectedClientIdState] = useState<string>(defaultClient?.id || currentUser.id || 'client-1');
  const [applicantName, setApplicantName] = useState(defaultClient?.fullName || currentUser.name || '');
  const [applicantEmail, setApplicantEmail] = useState(defaultClient?.email || currentUser.email || '');
  const [applicantPhone, setApplicantPhone] = useState(defaultClient?.phone || defaultClient?.mobile || '+971 50 123 4567');
  const [applicantPassportNo, setApplicantPassportNo] = useState(defaultClient?.passportNo || 'P89201948');
  const [applicantNationality, setApplicantNationality] = useState(defaultClient?.nationality || 'United Arab Emirates');
  const [originCountry, setOriginCountry] = useState(defaultClient?.nationality || 'United Arab Emirates');
  const [countryOfApplying, setCountryOfApplying] = useState('United Arab Emirates');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
  });
  const [specialNotes, setSpecialNotes] = useState('');
  const [showAIAdvisor, setShowAIAdvisor] = useState(true);
  const [showPhotoStudioModal, setShowPhotoStudioModal] = useState(false);

  // Sync country and visa type if catalog loads or changes
  useEffect(() => {
    const list = visaCountryCatalog || [];
    if (list.length === 0) return;

    if (!selectedCountry) {
      const match = preSelectedCountryCode
        ? list.find((c) => c && c.countryCode && c.countryCode.toLowerCase().trim() === preSelectedCountryCode.toLowerCase().trim())
        : list[0];
      const initialC = match || list[0];
      setSelectedCountry(initialC);
      if (initialC?.visaTypes?.length) {
        setSelectedVisaType(initialC.visaTypes[0]);
      }
    } else if (!selectedVisaType && selectedCountry.visaTypes?.length) {
      setSelectedVisaType(selectedCountry.visaTypes[0]);
    }
  }, [visaCountryCatalog, preSelectedCountryCode, selectedCountry, selectedVisaType]);

  // Uploaded Documents state
  const [uploadedDocsList, setUploadedDocsList] = useState<Omit<VisaUploadedDoc, 'id' | 'uploadedAt' | 'status'>[]>([
    {
      docName: 'Passport Copy (Bio Page & Cover)',
      docCategory: 'Passport',
      fileName: 'Applicant_Passport_Bio.pdf',
      fileSize: '2.1 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  ]);

  // Payment Options (Exclusive Nomod Live Gateway)
  const [paymentOption, setPaymentOption] = useState<'pay_now'>('pay_now');
  const [paymentMethod, setPaymentMethod] = useState<'nomod_online'>('nomod_online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdAppNumber, setCreatedAppNumber] = useState('');
  const [createdAppId, setCreatedAppId] = useState('');

  // Nomod Checkout Modal State
  const [isNomodModalOpen, setIsNomodModalOpen] = useState(false);
  const [nomodPaymentConfirmed, setNomodPaymentConfirmed] = useState(false);
  const [nomodPaymentRef, setNomodPaymentRef] = useState('');

  // Filter countries safely
  const filteredCountries = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return (visaCountryCatalog || []).filter((c) => {
      if (!c) return false;
      const matchRegion = selectedRegion === 'all' || c.region === selectedRegion;
      const matchQuery =
        !q ||
        (c.countryName && c.countryName.toLowerCase().includes(q)) ||
        (c.countryCode && c.countryCode.toLowerCase().includes(q)) ||
        (c.region && c.region.toLowerCase().includes(q)) ||
        (c.visaTypes && c.visaTypes.some((vt) => vt && vt.name && vt.name.toLowerCase().includes(q)));
      return matchRegion && matchQuery;
    });
  }, [visaCountryCatalog, searchQuery, selectedRegion]);

  // Unique regions list
  const regions = useMemo(() => {
    const set = new Set((visaCountryCatalog || []).map((c) => c && c.region).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [visaCountryCatalog]);

  // Update selected client details when client selection changes
  const handleClientChange = (cId: string) => {
    setSelectedClientIdState(cId);
    const cl = (clients || []).find((c) => c && c.id === cId);
    if (cl) {
      setApplicantName(cl.fullName || '');
      setApplicantEmail(cl.email || '');
      setApplicantPhone(cl.phone || cl.mobile || '');
      setApplicantPassportNo(cl.passportNo || '');
      if (cl.nationality) {
        setApplicantNationality(cl.nationality || '');
        setOriginCountry(cl.nationality || '');
      }
    }
  };

  // Switch country helper
  const handleCountrySelect = (country: VisaCountryOption) => {
    if (!country) return;
    setSelectedCountry(country);
    setSelectedVisaType(country.visaTypes?.[0] || null);
  };

  // Safe pricing calculations
  const speedSurcharge = useMemo(() => {
    if (!selectedVisaType) return 0;
    if (processingSpeed === 'Express / VIP') return selectedVisaType.expressSurcharge || 250;
    if (processingSpeed === 'Super Express (24h)') return (selectedVisaType.expressSurcharge || 250) * 2;
    return 0;
  }, [processingSpeed, selectedVisaType]);

  const governmentFee = selectedVisaType?.standardGovFee ?? 0;
  const serviceFee = (selectedVisaType?.standardServiceFee ?? 0) + speedSurcharge;
  const subtotal = governmentFee + serviceFee;
  const vatAmount = vatRate > 0 ? Math.round(((serviceFee * vatRate) / 100) * 100) / 100 : 0;
  const totalAmount = Math.round((subtotal + vatAmount) * 100) / 100;

  // Processing days
  const estimatedDays = useMemo(() => {
    if (!selectedVisaType) return 7;
    if (processingSpeed === 'Super Express (24h)') return 1;
    if (processingSpeed === 'Express / VIP') {
      return selectedVisaType.expressDays || Math.max(2, Math.floor((selectedVisaType.standardDays || 6) / 2));
    }
    return selectedVisaType.standardDays || 7;
  }, [processingSpeed, selectedVisaType]);

  const estimatedCompletionDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + estimatedDays);
    return d.toISOString();
  }, [estimatedDays]);

  // Doc upload handlers
  const handleUploadDoc = (doc: UploadDocItem) => {
    setUploadedDocsList((prev) => {
      const filtered = prev.filter(
        (d) => d.docName.toLowerCase().trim() !== doc.docName.toLowerCase().trim()
      );
      return [
        ...filtered,
        {
          docName: doc.docName,
          docCategory: doc.docCategory,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          fileUrl: doc.fileUrl,
        },
      ];
    });
  };

  const handleRemoveDoc = (docName: string) => {
    setUploadedDocsList((prev) =>
      prev.filter((d) => d.docName.toLowerCase().trim() !== docName.toLowerCase().trim())
    );
  };

  // Submit Visa Application
  const handleSubmit = () => {
    if (!selectedCountry || !selectedVisaType) return;
    setIsSubmitting(true);

    const clientObj =
      (clients || []).find((c) => c && c.id === selectedClientIdState) ||
      defaultClient ||
      (currentUser.role === 'client'
        ? (clients || []).find(
            (c) =>
              c &&
              c.email &&
              currentUser.email &&
              c.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
          )
        : null) ||
      clients?.[0] || {
        id: selectedClientIdState || currentUser.id || 'client-walkin',
        fullName: applicantName || currentUser.name || 'Applicant',
        email: applicantEmail || currentUser.email || 'client@example.com',
        phone: applicantPhone || '+971 50 000 0000',
        passportNo: applicantPassportNo || 'P89201948',
        nationality: applicantNationality || 'UAE Resident',
        companyId: selectedCompanyId !== 'all' ? selectedCompanyId : companies?.[0]?.id || 'comp-1',
      };

    const targetCompId =
      clientObj?.companyId ||
      (selectedCompanyId !== 'all' ? selectedCompanyId : companies?.[0]?.id || 'comp-1');

    // For online applications, set unassigned so Admin can review and assign appropriately
    const assignedStaffId = (clientObj as any)?.assignedEmployeeIds?.[0] || '';
    const assignedStaffName = (clientObj as any)?.assignedEmployeeNames?.[0] || (assignedStaffId ? 'Assigned PRO' : 'Unassigned (Action Required)');

    const result = applyForVisaService(
      {
        clientId: clientObj.id,
        clientName: applicantName || clientObj.fullName || 'Applicant',
        clientEmail: applicantEmail || clientObj.email || 'client@example.com',
        clientPhone: applicantPhone || clientObj.phone || (clientObj as any).mobile || '+971 50 000 0000',
        clientPassportNo: applicantPassportNo || clientObj.passportNo || 'P89201948',
        clientNationality: applicantNationality || clientObj.nationality || 'UAE Resident',
        originCountry: originCountry || applicantNationality || 'United Arab Emirates',
        countryOfApplying: countryOfApplying || 'United Arab Emirates',
        companyId: targetCompId,
        targetCountry: selectedCountry.countryName,
        targetCountryCode: selectedCountry.countryCode,
        targetCountryFlag: selectedCountry.flag,
        targetRegion: selectedCountry.region,
        visaCategory: selectedVisaType.category,
        visaType: selectedVisaType.name,
        entryType: selectedVisaType.entryType,
        validityDuration: selectedVisaType.validityDuration,
        stayDuration: selectedVisaType.stayDuration,
        processingSpeed,
        estimatedProcessingDays: estimatedDays,
        estimatedCompletionDate,
        travelDate,
        governmentFee,
        serviceFee,
        vatRate,
        vatAmount,
        totalAmount,
        assignedOfficerName: assignedStaffName,
        assignedOfficerId: assignedStaffId,
        uploadedDocuments: uploadedDocsList.map((doc, idx) => ({
          ...doc,
          id: `vdoc-${Date.now()}-${idx}`,
          uploadedAt: new Date().toISOString(),
          status: 'verified' as const,
        })),
        notes: specialNotes || `Travel date: ${travelDate}. Processing: ${processingSpeed}. Applied via Client Portal. Origin: ${originCountry}. Applying from: ${countryOfApplying}.`,
      },
      {
        autoInvoice: true,
        initialPayment:
          paymentOption === 'pay_now' && paymentMethod !== 'nomod_online'
            ? {
                amount: totalAmount,
                method: paymentMethod === 'bank_transfer' ? ('Bank Transfer' as const) : ('Cash' as const),
                reference: `MANUAL-PAY-${Math.floor(10000 + Math.random() * 90000)}`,
                notes: `Payment cleared for ${selectedCountry.countryName} visa`,
              }
            : undefined,
      }
    );

    setIsSubmitting(false);

    if (result.success && result.application) {
      setCreatedAppNumber(result.application.applicationNumber);
      setCreatedAppId(result.application.id);

      if (paymentOption === 'pay_now' && paymentMethod === 'nomod_online') {
        // Open Nomod Checkout Modal
        setIsNomodModalOpen(true);
      } else {
        setSubmitSuccess(true);
      }
    }
  };

  const handleNomodSuccess = (paymentResult: any) => {
    setIsNomodModalOpen(false);
    setNomodPaymentConfirmed(true);
    setNomodPaymentRef(paymentResult.reference);

    if (createdAppId) {
      confirmNomodPayment(createdAppId, paymentResult);
    }
    setSubmitSuccess(true);
  };

  const handleNomodOutcome = (paymentResult: any) => {
    if (createdAppId) {
      confirmNomodPayment(createdAppId, paymentResult);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="visa-application-modal"
        className="relative flex flex-col w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold tracking-tight">Worldwide Visa Services Desk</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Global Clearance
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Apply for travel, tourist, business, work & Golden visas for 190+ countries with live milestone tracking.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation */}
        {!submitSuccess && (
          <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-2.5 text-xs">
            {[
              { num: 1, label: '1. Select Country & Visa' },
              { num: 2, label: '2. Applicant Profile' },
              { num: 3, label: '3. Required Documents' },
              { num: 4, label: '4. Summary & Submit' },
            ].map((st) => (
              <button
                key={st.num}
                onClick={() => setStep(st.num)}
                className={`flex items-center justify-center py-1 px-2 rounded-lg font-medium transition-all ${
                  step === st.num
                    ? 'bg-blue-600 text-white shadow-sm'
                    : step > st.num
                    ? 'text-emerald-600 dark:text-emerald-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="truncate">{st.label}</span>
                {step > st.num && <Check className="w-3.5 h-3.5 ml-1 text-emerald-500" />}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {submitSuccess ? (
            /* Success View */
            <div className="text-center py-10 px-4 max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="flex flex-col items-center justify-center">
                <CountryFlag countryCode={selectedCountry?.countryCode} flag={selectedCountry?.flag} countryName={selectedCountry?.countryName} size="3xl" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  Visa Application Registered!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Application <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{createdAppNumber}</span> for{' '}
                  <span className="font-semibold">{selectedCountry?.countryName}</span> ({selectedVisaType?.name || 'Visa'}) is now actively assigned to our consular team.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Country:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedCountry?.countryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Visa Category:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedVisaType?.name || 'Visa'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Processing Speed:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{processingSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {new Date(estimatedCompletionDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Total Cleared:</span>
                  <span className="text-blue-600 dark:text-blue-400">AED {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all"
                >
                  View in Visa Tracker & Timeline
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Country & Visa Type Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Search and Region Filter */}
                  <div className="flex flex-col sm:row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Search country, visa type, or region (e.g. France, Schengen, UK, Japan, Saudi)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    {/* Region Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                      {regions.map((reg) => (
                        <button
                          key={reg}
                          onClick={() => setSelectedRegion(reg)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            selectedRegion === reg
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {reg === 'all' ? 'All Global Destinations' : reg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Countries Grid */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                      Select Target Destination ({filteredCountries.length} Countries Available)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
                      {filteredCountries.map((c) => {
                        const isSelected = selectedCountry?.countryCode === c.countryCode;
                        return (
                          <button
                            key={c.countryCode}
                            onClick={() => handleCountrySelect(c)}
                            className={`flex items-center space-x-2.5 p-2.5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:border-blue-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <CountryFlag countryCode={c.countryCode} flag={c.flag} countryName={c.countryName} size="lg" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate">{c.countryName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{c.visaTypes.length} Visa Options</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visa Type Selection */}
                  {selectedCountry && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CountryFlag countryCode={selectedCountry.countryCode} flag={selectedCountry.flag} countryName={selectedCountry.countryName} size="lg" />
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            Available Visa Categories for {selectedCountry.countryName}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-500">
                          Region: {selectedCountry.region}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedCountry.visaTypes.map((vt) => {
                          const isSelected = selectedVisaType?.id === vt.id;
                          return (
                            <div
                              key={vt.id}
                              onClick={() => setSelectedVisaType(vt)}
                              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                                isSelected
                                  ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
                                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                      {vt.category}
                                    </span>
                                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                      {vt.entryType}
                                    </span>
                                  </div>
                                  <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                                    {vt.name}
                                  </h5>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                    AED {(vt.standardGovFee + vt.standardServiceFee).toLocaleString()}
                                  </p>
                                  <p className="text-[10px] text-slate-500">Standard Fee</p>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                                {vt.description}
                              </p>

                              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Validity:</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-200">{vt.validityDuration}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Max Stay:</span>
                                  <span className="font-semibold text-slate-700 dark:text-slate-200">{vt.stayDuration}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Processing:</span>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{vt.standardDays} Days</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Processing Speed Priority Selection */}
                      <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center mb-2.5">
                          <Clock className="w-4 h-4 mr-1.5 text-blue-500" />
                          Consular Processing Speed & Priority
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {[
                            {
                              id: 'Standard',
                              name: 'Standard Processing',
                              time: `${selectedVisaType?.standardDays || 7} Business Days`,
                              badge: 'Standard Queue',
                              fee: 'AED 0',
                            },
                            {
                              id: 'Express / VIP',
                              name: 'Express / VIP Embassy Appointment',
                              time: `${selectedVisaType?.expressDays || Math.max(2, Math.floor((selectedVisaType?.standardDays || 6) / 2))} Days`,
                              badge: 'Priority Slot',
                              fee: `+AED ${selectedVisaType?.expressSurcharge || 250}`,
                            },
                            {
                              id: 'Super Express (24h)',
                              name: 'Super Express 24-Hour Expedited',
                              time: '24-48 Hours',
                              badge: 'Same-Day Submission',
                              fee: `+AED ${(selectedVisaType?.expressSurcharge || 250) * 2}`,
                            },
                          ].map((speed) => (
                            <button
                              key={speed.id}
                              onClick={() => setProcessingSpeed(speed.id as any)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                processingSpeed === speed.id
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  processingSpeed === speed.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                  {speed.badge}
                                </span>
                                <span className="text-xs font-bold">{speed.fee}</span>
                              </div>
                              <p className="text-xs font-bold mt-1.5">{speed.name}</p>
                              <p className={`text-[11px] mt-0.5 ${processingSpeed === speed.id ? 'text-blue-100' : 'text-slate-500'}`}>
                                Est. Turnaround: {speed.time}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* AI Country Visa Advisor & Search Grounding Section */}
                      <div className="mt-4 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl overflow-hidden shadow-md">
                        <div
                          onClick={() => setShowAIAdvisor(!showAIAdvisor)}
                          className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 flex items-center justify-between cursor-pointer text-white hover:bg-slate-800/90 transition-all"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-white">
                                  AI Country Visa Intelligence & Search Grounding
                                </p>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  ⚡ Google Search Verified (2026)
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Live visa rules, embassy processing speed & checklist for {selectedCountry.countryName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                              {showAIAdvisor ? 'Hide Intelligence' : 'Inspect Rules'}
                            </span>
                            {showAIAdvisor ? (
                              <ChevronUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {showAIAdvisor && (
                          <div className="p-2 bg-slate-950">
                            <AIVisaCountryAdvisor
                              initialDestination={selectedCountry.countryName}
                              initialNationality={applicantNationality || originCountry || 'United Arab Emirates'}
                              initialVisaType={selectedVisaType?.name || 'Tourist / Visit Visa'}
                              compact={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Applicant Profile */}
              {step === 2 && (
                <div className="space-y-5">
                  {!isClientUser && (
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <label className="text-xs font-bold text-blue-900 dark:text-blue-200 block mb-1.5">
                        Link Existing Client Profile:
                      </label>
                      <select
                        value={selectedClientIdState}
                        onChange={(e) => handleClientChange(e.target.value)}
                        className="w-full py-2 px-3 text-sm rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName} ({c.email}) - {c.companyName || 'Individual'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Full Legal Name (as in Passport) *
                      </label>
                      <input
                        type="text"
                        value={applicantName ?? ''}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Alexander Wright"
                        className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Passport Number *
                      </label>
                      <input
                        type="text"
                        value={applicantPassportNo ?? ''}
                        onChange={(e) => setApplicantPassportNo(e.target.value)}
                        placeholder="e.g. P89201948"
                        className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        value={applicantNationality ?? ''}
                        onChange={(e) => {
                          setApplicantNationality(e.target.value);
                          if (!originCountry) setOriginCountry(e.target.value);
                        }}
                        placeholder="e.g. British / Indian / Pakistani / Emirati"
                        className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Origin Country (Country of Citizenship / Passport) *
                      </label>
                      <input
                        type="text"
                        value={originCountry ?? ''}
                        onChange={(e) => setOriginCountry(e.target.value)}
                        placeholder="e.g. India, United Kingdom, Pakistan, Philippines"
                        className="w-full py-2 px-3 text-sm rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Determines consular entry visa criteria</span>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Country of Applying (Where You Are Applying From) *
                      </label>
                      <input
                        type="text"
                        value={countryOfApplying ?? ''}
                        onChange={(e) => setCountryOfApplying(e.target.value)}
                        placeholder="e.g. United Arab Emirates, Saudi Arabia, Oman"
                        className="w-full py-2 px-3 text-sm rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Current location of residence / embassy jurisdiction</span>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Expected Travel / Entry Date *
                      </label>
                      <input
                        type="date"
                        value={travelDate ?? ''}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Email Address (for Status Notifications) *
                      </label>
                      <input
                        type="email"
                        value={applicantEmail ?? ''}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="e.g. alex@example.com"
                        className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={applicantPhone ?? ''}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="e.g. +971 50 123 4567"
                        className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Special Travel Purpose & Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={specialNotes ?? ''}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g. Attending Paris Tech Expo, visiting relatives, express biometrics required..."
                      className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Required Documents */}
              {step === 3 && (
                <VisaDocumentUploadSection
                  requiredDocuments={
                    selectedVisaType?.requiredDocuments || [
                      'Passport Copy (Bio Page & Signature)',
                      'Recent Biometric Photograph (White Background)',
                      'Proof of Accommodation or Hotel Booking',
                      'Flight Itinerary / Return Reservation',
                      'Bank Statement (Last 3 to 6 Months)',
                    ]
                  }
                  uploadedDocs={uploadedDocsList}
                  onUploadDoc={handleUploadDoc}
                  onRemoveDoc={handleRemoveDoc}
                  countryName={selectedCountry?.countryName}
                  visaName={selectedVisaType?.name}
                  applicantName={applicantName || 'Applicant'}
                />
              )}

              {/* STEP 4: Review & Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/80 dark:to-slate-900/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <CountryFlag countryCode={selectedCountry?.countryCode} flag={selectedCountry?.flag} countryName={selectedCountry?.countryName} size="2xl" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {selectedCountry?.countryName} - {selectedVisaType?.name || 'Visa'}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Speed: <strong className="text-blue-600 dark:text-blue-400">{processingSpeed}</strong> | Est. {estimatedDays} Days
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Ready for Submission
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Applicant:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{applicantName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Passport No:</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{applicantPassportNo}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Origin Country:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{originCountry || applicantNationality}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Country Applying From:</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{countryOfApplying}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Travel Date:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{travelDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Documents:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{uploadedDocsList.length} Files</span>
                      </div>
                    </div>
                  </div>

                  {/* Attached Documents Preview in Review Step */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        Attached Consular Dossier Documents ({uploadedDocsList.length})
                      </h5>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Edit Documents
                      </button>
                    </div>

                    {uploadedDocsList.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        No documents attached. You can proceed, but passport and photos may be requested later.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {uploadedDocsList.map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <div className="truncate">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{doc.docName}</p>
                                <p className="text-[10px] text-slate-400 truncate">{doc.fileName} • {doc.fileSize}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0 ml-2">
                              Ready
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fee Breakdown */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Transparent Fee Breakdown
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>Official Government & Consular Fee:</span>
                        <span className="font-semibold font-mono">AED {governmentFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>PRO Dossier Prep & Attestation Service Fee:</span>
                        <span className="font-semibold font-mono">AED {(selectedVisaType?.standardServiceFee ?? 0).toLocaleString()}</span>
                      </div>
                      {speedSurcharge > 0 && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span>{processingSpeed} Priority Surcharge:</span>
                          <span className="font-semibold font-mono">+AED {speedSurcharge.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span>UAE VAT ({vatRate}%):</span>
                          <div className="flex items-center gap-1">
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
                        </div>
                        <span className="font-semibold font-mono">
                          AED {vatAmount.toLocaleString()} {vatRate === 0 ? '(0% Exempt)' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span>Total Due:</span>
                        <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">
                          AED {totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Exclusive Payment Settlement Method: Nomod Live */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Exclusive Payment Gateway
                      </h5>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Nomod Live Gateway
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                            <Zap className="w-5 h-5 fill-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                Nomod Official Payment Gateway
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                Live
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Processed directly through Nomod Merchant Account • UAE & International Cards, Apple Pay, Google Pay
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200 dark:border-blue-900/60 text-[11px]">
                        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          <span>Visa / MC / AMEX</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                          <Smartphone className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                          <span>Apple / Google Pay</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Instant Auto-Invoice</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!submitSuccess && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <div className="flex items-center space-x-2">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all"
                >
                  Previous Step
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Total Fee: <strong className="text-blue-600 dark:text-blue-400 font-mono">AED {totalAmount.toLocaleString()}</strong>
              </span>

              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering Application...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {paymentOption === 'pay_now' && paymentMethod === 'nomod_online'
                          ? `Pay Online with Nomod (AED ${totalAmount.toLocaleString()})`
                          : `Submit Visa Application (AED ${totalAmount.toLocaleString()})`}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nomod Checkout Modal */}
      {isNomodModalOpen && (
        <NomodCheckoutModal
          isOpen={isNomodModalOpen}
          onClose={() => {
            setIsNomodModalOpen(false);
            setSubmitSuccess(true);
          }}
          amount={totalAmount}
          currency="AED"
          description={`${selectedCountry?.countryName} ${selectedVisaType?.name || 'Visa'} (${processingSpeed}) - App #${createdAppNumber}`}
          customerName={applicantName}
          customerEmail={applicantEmail}
          customerPhone={applicantPhone}
          applicationId={createdAppId}
          onPaymentSuccess={handleNomodSuccess}
          onPaymentOutcome={handleNomodOutcome}
        />
      )}
    </div>
  );
};
