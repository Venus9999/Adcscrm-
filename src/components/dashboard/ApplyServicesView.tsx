import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  FileCheck,
  Globe2,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Clock,
  Briefcase,
  Layers,
  FileText,
  Users,
  Stamp,
  CreditCard,
  Check,
  HelpCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Client } from '../../types/crm';

interface ApplyServicesViewProps {
  client: Client;
  onServiceApplied?: () => void;
}

interface ServiceOffering {
  id: string;
  name: string;
  category: 'visa' | 'company_formation' | 'corporate_tax' | 'pro_clearance' | 'attestation' | 'general';
  departmentName: string;
  description: string;
  basePrice: number;
  govFee: number;
  processingTime: string;
  badge: string;
  features: string[];
  options: {
    id: string;
    label: string;
    price: number;
    description: string;
  }[];
}

const SERVICE_CATALOG: ServiceOffering[] = [
  {
    id: 'uae_golden_visa',
    name: 'UAE 10-Year Golden Visa (Investor / Executive / Talent)',
    category: 'visa',
    departmentName: 'Immigration & Visa Processing',
    description: 'Long-term 10-year residency for investors, entrepreneurs, specialized talents, doctors, and executive leaders with 100% foreign ownership.',
    basePrice: 4500,
    govFee: 3200,
    processingTime: '5 - 7 Business Days',
    badge: 'TOP REQUESTED',
    features: [
      'ICP / GDRFA Federal nomination submission',
      'VIP Medical Fitness typing & Emirates ID fast-track',
      'Family sponsorship included without deposit',
      'No maximum stay outside UAE limits',
    ],
    options: [
      { id: 'vip_express', label: 'VIP 48-Hour Priority Clearance', price: 1500, description: 'Dedicated PRO officer handles doorstep biometric priority' },
      { id: 'dep_sponsor', label: 'Include Family / Dependent Quota', price: 950, description: 'Pre-clearance for spouse and children visas' },
    ],
  },
  {
    id: 'freezone_company_setup',
    name: 'Dubai & Northern Emirates Free Zone Company Formation',
    category: 'company_formation',
    departmentName: 'Corporate Services & Trade Licensing',
    description: 'Turnkey company formation across IFZA, Meydan, DMCC, or RAKEZ with trade license, MOA, lease agreement, and immigration card.',
    basePrice: 8500,
    govFee: 4900,
    processingTime: '3 - 5 Business Days',
    badge: '100% OWNERSHIP',
    features: [
      'Name reservation & Initial Security Approval',
      'Digital Memorandum of Association (MOA)',
      'Establishment Card / Immigration File',
      'Zero corporate tax assistance under qualify threshold',
    ],
    options: [
      { id: 'flexi_desk', label: 'Virtual Office / Flexi Desk Lease', price: 2200, description: '1-Year official registered address & tenancy contract' },
      { id: 'bank_priority', label: 'Corporate Bank Account VIP Assistance', price: 1800, description: 'Guaranteed introduction to Emirates NBD, Mashreq, or Wio' },
    ],
  },
  {
    id: 'residence_employment_visa',
    name: 'UAE 2-Year Residency & Employment Visa Clearance',
    category: 'visa',
    departmentName: 'Immigration & Visa Processing',
    description: 'Complete end-to-end processing for partner, investor, or employee residence visas with entry permit and status change.',
    basePrice: 2800,
    govFee: 2100,
    processingTime: '4 - 6 Business Days',
    badge: 'POPULAR',
    features: [
      'MOHRE Offer Letter & Work Permit approval',
      'Electronic Entry Permit & in-country Status Change',
      'Medical examination appointment scheduling',
      'Emirates ID card printing & door delivery',
    ],
    options: [
      { id: 'urgent_medical', label: 'VIP Express Medical (4hr Results)', price: 650, description: 'Smart Salem AI lounge fast-track medical fitness test' },
      { id: 'status_change', label: 'In-Country Status Change (Without Exit)', price: 850, description: 'Clear visa transfer without exiting the UAE borders' },
    ],
  },
  {
    id: 'corporate_tax_vat',
    name: 'FTA Corporate Tax Registration & Quarterly VAT Filing',
    category: 'corporate_tax',
    departmentName: 'Accounting & Tax Advisory',
    description: 'Comprehensive compliance with the Federal Tax Authority (FTA), corporate tax number issuance, VAT registration, and annual filings.',
    basePrice: 1950,
    govFee: 0,
    processingTime: '2 - 4 Business Days',
    badge: 'FTA COMPLIANT',
    features: [
      'Corporate Tax registration & EmaraTax portal setup',
      'Tax Registration Number (TRN) certificate',
      'Quarterly VAT return preparation & audit review',
      'Corporate tax exemption applicability analysis',
    ],
    options: [
      { id: 'annual_bookkeeping', label: 'Full Year Bookkeeping & Cloud Accounting', price: 3400, description: 'Monthly ledger maintenance & P&L statements' },
    ],
  },
  {
    id: 'mofa_attestation',
    name: 'MOFA UAE & Embassy Document Attestation',
    category: 'attestation',
    departmentName: 'Legal & Compliance',
    description: 'Certified legalization for degrees, marriage certificates, birth certificates, board resolutions, and commercial powers of attorney.',
    basePrice: 1200,
    govFee: 450,
    processingTime: '3 - 5 Business Days',
    badge: 'CERTIFIED',
    features: [
      'Embassy / Consulate verification & stamp',
      'Ministry of Foreign Affairs (MOFA UAE) digital stamp',
      'Ministry of Justice legal Arabic translation',
      'Secure courier pickup and return to your door',
    ],
    options: [
      { id: 'legal_translation', label: 'Legal Arabic Translation (Per Document)', price: 300, description: 'Certified Ministry of Justice sworn translation' },
    ],
  },
  {
    id: 'pro_government_clearance',
    name: 'Annual Corporate PRO & Government Clearance Retainer',
    category: 'pro_clearance',
    departmentName: 'Government Relations & PRO Services',
    description: 'Dedicated public relations officer handling establishment renewals, DED license modifications, immigration files, and MOHRE quotas.',
    basePrice: 5000,
    govFee: 1500,
    processingTime: 'Ongoing 12 Months',
    badge: 'CORPORATE PLAN',
    features: [
      'Establishment card annual renewal',
      'Trade license activity amendments',
      'Labour quota increase & inspection coordination',
      'Dedicated PRO WhatsApp group & hotline',
    ],
    options: [
      { id: 'vip_concierge', label: 'Doorstep Courier & Messenger Dispatch', price: 1200, description: 'Unlimited physical document collection across UAE' },
    ],
  },
];

export const ApplyServicesView: React.FC<ApplyServicesViewProps> = ({ client, onServiceApplied }) => {
  const { applyForService, departments, serviceCategories, companies, currentUser } = useCRM();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activeServiceModal, setActiveServiceModal] = useState<ServiceOffering | null>(null);

  // Determine B2B vs B2C pricing & Corporate Discounts (Strictly B2C for client role)
  const clientCompany = companies.find((c) => c.id === client.companyId);
  const isDirectClient = !!client.isDirectRegistration || client.pricingTier === 'b2c' || (!client.companyId);
  const isB2B = currentUser.role !== 'client' && !isDirectClient;
  const clientDiscountType = client.discountType || clientCompany?.corporateDiscountType || 'percentage';
  const clientDiscountVal = client.discountValue ?? (clientDiscountType === 'fixed' ? (clientCompany?.corporateDiscountValue ?? 500) : (client.corporateDiscountPercent ?? clientCompany?.corporateDiscountPercent ?? 15));

  // Form State inside Apply Modal
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [clientNotes, setClientNotes] = useState('');
  const [applicantPassport, setApplicantPassport] = useState(client.passportNo || '');
  const [applicantNationality, setApplicantNationality] = useState(client.nationality || 'United Arab Emirates');
  const [payNow, setPayNow] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Helper to get effective price for a service item
  const getServicePricing = (service: ServiceOffering) => {
    // Check if matching in CRM serviceCategories
    const matchedCategory = serviceCategories.find((c) => c.id === service.id || c.name.toLowerCase() === service.name.toLowerCase());
    const baseB2C = matchedCategory?.priceB2C ?? matchedCategory?.defaultPrice ?? service.basePrice;
    
    let effectivePrice = baseB2C;
    let discountAmount = 0;
    let discountPercent = 0;

    if (isB2B) {
      if (client.customServiceRate !== undefined && client.customServiceRate > 0) {
        effectivePrice = client.customServiceRate;
        discountAmount = Math.max(0, baseB2C - client.customServiceRate);
        discountPercent = baseB2C > 0 ? Math.round((discountAmount / baseB2C) * 100) : 0;
      } else if (matchedCategory?.priceB2B !== undefined && matchedCategory.priceB2B > 0 && !client.discountValue) {
        effectivePrice = matchedCategory.priceB2B;
        discountAmount = Math.max(0, baseB2C - matchedCategory.priceB2B);
        discountPercent = baseB2C > 0 ? Math.round((discountAmount / baseB2C) * 100) : (clientDiscountType === 'percentage' ? clientDiscountVal : 15);
      } else if (clientDiscountType === 'fixed') {
        discountAmount = Math.min(baseB2C, clientDiscountVal);
        discountPercent = baseB2C > 0 ? Math.round((discountAmount / baseB2C) * 100) : 0;
        effectivePrice = Math.max(0, baseB2C - discountAmount);
      } else {
        // percentage
        discountPercent = clientDiscountVal;
        discountAmount = Math.round(baseB2C * (clientDiscountVal / 100));
        effectivePrice = Math.max(0, baseB2C - discountAmount);
      }
    }

    return {
      baseB2C,
      effectivePrice,
      discountAmount,
      discountPercent,
      discountType: clientDiscountType,
      discountVal: clientDiscountVal,
      govFee: matchedCategory?.governmentFees ?? service.govFee,
    };
  };

  const filteredCatalog = SERVICE_CATALOG.filter((item) => {
    if (selectedCategoryFilter === 'all') return true;
    return item.category === selectedCategoryFilter;
  });

  const handleOpenModal = (service: ServiceOffering) => {
    setActiveServiceModal(service);
    setSelectedOptions([]);
    setClientNotes('');
    setApplicantPassport(client.passportNo || '');
    setApplicantNationality(client.nationality || 'United Arab Emirates');
    setPayNow(true);
    setSubmissionSuccess(null);
  };

  const toggleOption = (optId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  const calculateTotal = (service: ServiceOffering) => {
    const { effectivePrice, govFee } = getServicePricing(service);
    let total = effectivePrice + govFee;
    service.options.forEach((opt) => {
      if (selectedOptions.includes(opt.id)) {
        total += opt.price;
      }
    });
    return total;
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeServiceModal) return;

    setIsSubmitting(true);

    const chosenDepartment = departments.find(
      (d) => d.name.toLowerCase().includes(activeServiceModal.category) || d.isActive
    ) || departments[0];

    const totalAmount = calculateTotal(activeServiceModal);

    try {
      const res = await applyForService(
        activeServiceModal.id,
        clientNotes.trim() || `Self-service application for ${activeServiceModal.name} (${applicantPassport ? `Passport: ${applicantPassport}` : ''})`,
        client.companyId
      );

      setIsSubmitting(false);

      if (res.success) {
        setSubmissionSuccess(
          `Application for "${activeServiceModal.name}" submitted successfully! Reference Number: ${res.service?.referenceNumber || 'Generated'}. An official proforma invoice and stage tracker have been opened.`
        );
        if (onServiceApplied) {
          onServiceApplied();
        }
      } else {
        alert(res.error || 'Failed to submit application.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || 'Error occurred while applying.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                Direct Government & Corporate Clearance
              </span>
              {isB2B ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>
                    Corporate B2B Account ({clientDiscountType === 'fixed' ? `AED ${clientDiscountVal.toLocaleString()} Fixed Discount` : `${clientDiscountVal}% Discount`} Active)
                  </span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                  Direct Client Portal (B2C Rates)
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Apply for Official UAE Services</span>
            </h2>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Select verified residency visas, mainland/free zone trade licensing, tax registrations, or certified document attestations. Applications are routed directly to licensed PRO officers and tracked in real time.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-xs shrink-0 space-y-1">
            <div className="flex items-center gap-2 text-white font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Guaranteed Processing SLA</span>
            </div>
            <div className="text-[11px] text-blue-100">
              Direct ICP, GDRFA, DED, MOHRE, and FTA integration.
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Services' },
          { id: 'visa', label: 'Residency & Golden Visas' },
          { id: 'company_formation', label: 'Company Setup & Licensing' },
          { id: 'corporate_tax', label: 'Corporate Tax & VAT' },
          { id: 'attestation', label: 'Legal Attestation' },
          { id: 'pro_clearance', label: 'PRO & Labour Clearance' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedCategoryFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              selectedCategoryFilter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Service Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCatalog.map((service) => {
          const pricing = getServicePricing(service);
          const totalEstimated = pricing.effectivePrice + pricing.govFee;

          return (
            <div
              key={service.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                      {service.badge}
                    </span>
                    {isB2B && pricing.discountAmount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        {pricing.discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service.processingTime}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {service.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {service.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Package Inclusions:
                  </div>
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isB2B ? 'Corporate B2B Total' : 'Total Est. Fee'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      AED {totalEstimated.toLocaleString()}
                    </span>
                    {isB2B && pricing.discountAmount > 0 && (
                      <span className="text-xs text-slate-400 line-through">
                        AED {(pricing.baseB2C + pricing.govFee).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenModal(service)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Application & Customization Modal */}
      {activeServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md uppercase">
                    Service Application
                  </span>
                  <span className="text-xs text-slate-400">
                    Dept: {activeServiceModal.departmentName}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {activeServiceModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveServiceModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submissionSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Application Submitted Successfully!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                    {submissionSuccess}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveServiceModal(null)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  View My Residency & Service Tracker
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-5">
                {/* Applicant Profile Verification */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Applicant Identity & Verification</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Applicant Name
                      </label>
                      <input
                        type="text"
                        disabled
                        value={client.fullName}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-700 dark:text-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Passport / National ID Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={applicantPassport}
                        onChange={(e) => setApplicantPassport(e.target.value)}
                        placeholder="e.g. N12345678"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Service Add-ons */}
                {activeServiceModal.options.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Optional Service Upgrades & Add-ons</span>
                    </h4>
                    <div className="space-y-2">
                      {activeServiceModal.options.map((opt) => {
                        const isChecked = selectedOptions.includes(opt.id);
                        return (
                          <label
                            key={opt.id}
                            onClick={() => toggleOption(opt.id)}
                            className={`p-3 rounded-2xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600'
                                : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center transition-all ${
                                  isChecked ? 'bg-blue-600 text-white' : 'border border-slate-400 dark:border-slate-600'
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3" />}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                  {opt.label}
                                </span>
                                <span className="text-[11px] text-slate-500">{opt.description}</span>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                              + AED {opt.price.toLocaleString()}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Remarks / Document Links */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Special Instructions or Company Reference
                  </label>
                  <textarea
                    rows={2}
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Provide any specific notes, sponsor information, or urgent timelines..."
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Payment Option & Price Summary */}
                {(() => {
                  const pricing = getServicePricing(activeServiceModal);
                  return (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>Standard Professional Service Fee:</span>
                        <span>AED {pricing.baseB2C.toLocaleString()}</span>
                      </div>

                      {isB2B && pricing.discountAmount > 0 && (
                        <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span>Corporate B2B Discount ({pricing.discountPercent}% OFF):</span>
                          <span>- AED {pricing.discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>Official UAE Government & Typing Fee:</span>
                        <span>AED {pricing.govFee.toLocaleString()}</span>
                      </div>

                      {selectedOptions.length > 0 && (
                        <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400">
                          <span>Selected Upgrades ({selectedOptions.length}):</span>
                          <span>
                            AED{' '}
                            {(activeServiceModal.options || [])
                              .filter((o) => o && selectedOptions.includes(o.id))
                              .reduce((sum, o) => sum + (o?.price || 0), 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                        <span>Total Amount Payable:</span>
                        <span className="text-base text-blue-600 dark:text-blue-400">
                          AED {calculateTotal(activeServiceModal).toLocaleString()}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={payNow}
                            onChange={(e) => setPayNow(e.target.checked)}
                            className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Process and record initial payment immediately</span>
                        </label>
                      </div>
                    </div>
                  );
                })()}

                {/* Modal CTAs */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveServiceModal(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span>Submitting Application...</span>
                    ) : (
                      <>
                        <span>Confirm & Submit Service Application</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
