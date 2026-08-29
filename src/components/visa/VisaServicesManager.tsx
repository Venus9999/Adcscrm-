import React, { useState, useMemo } from 'react';
import {
  Globe,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  Plane,
  ChevronRight,
  Sparkles,
  User,
  ArrowUpRight,
  Eye,
  Trash2,
  Building,
  Check,
  Compass,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { WORLD_VISA_COUNTRIES, VisaCountryOption } from '../../data/countriesData';
import { VisaApplication, VisaApplicationStatus } from '../../types/crm';
import { VisaApplicationModal } from './VisaApplicationModal';
import { VisaTimelineModal } from './VisaTimelineModal';

export const VisaServicesManager: React.FC = () => {
  const {
    currentUser,
    visaApplications,
    filteredVisaApplications,
    deleteVisaApplication,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'applications' | 'catalog'>('applications');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [preSelectedCountryCode, setPreSelectedCountryCode] = useState<string | undefined>(undefined);
  const [timelineModalApp, setTimelineModalApp] = useState<VisaApplication | null>(null);

  const isClientRole = currentUser.role === 'client';

  // Filtered applications list
  const displayApplications = useMemo(() => {
    const list = isClientRole
      ? visaApplications.filter(
          (a) =>
            a.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
            a.clientId === currentUser.id
        )
      : filteredVisaApplications;

    return list.filter((app) => {
      const matchStatus = selectedStatusFilter === 'all' || app.status === selectedStatusFilter;
      const matchRegion = selectedRegion === 'all' || app.targetRegion === selectedRegion;
      const matchQuery =
        !searchQuery ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.targetCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.visaType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.clientPassportNo && app.clientPassportNo.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStatus && matchRegion && matchQuery;
    });
  }, [
    isClientRole,
    visaApplications,
    filteredVisaApplications,
    currentUser,
    selectedStatusFilter,
    selectedRegion,
    searchQuery,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const apps = isClientRole
      ? visaApplications.filter(
          (a) =>
            a.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
            a.clientId === currentUser.id
        )
      : visaApplications;

    const total = apps.length;
    const underReview = apps.filter(
      (a) => a.status === 'embassy_processing' || a.status === 'documents_verification'
    ).length;
    const biometrics = apps.filter((a) => a.status === 'biometrics_appointment').length;
    const completed = apps.filter((a) => a.status === 'issued' || a.status === 'approved').length;
    const totalFees = apps.reduce((sum, a) => sum + (a.totalAmount || 0), 0);

    return { total, underReview, biometrics, completed, totalFees };
  }, [visaApplications, isClientRole, currentUser]);

  // Catalog Countries filtered
  const filteredCatalogCountries = useMemo(() => {
    return WORLD_VISA_COUNTRIES.filter((c) => {
      const matchRegion = selectedRegion === 'all' || c.region === selectedRegion;
      const matchQuery =
        !searchQuery ||
        c.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.countryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.visaTypes.some((vt) => vt.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchRegion && matchQuery;
    });
  }, [searchQuery, selectedRegion]);

  const regions = useMemo(() => {
    const set = new Set(WORLD_VISA_COUNTRIES.map((c) => c.region));
    return ['all', ...Array.from(set)];
  }, []);

  const handleOpenApplyForCountry = (code: string) => {
    setPreSelectedCountryCode(code);
    setIsApplyModalOpen(true);
  };

  const getStatusBadge = (status: VisaApplicationStatus) => {
    const map: Record<VisaApplicationStatus, { label: string; class: string }> = {
      submitted: { label: 'Submitted', class: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
      documents_verification: { label: 'Dossier Intake', class: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' },
      payment_completed: { label: 'Fees Paid', class: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300' },
      biometrics_appointment: { label: 'Biometrics Scheduled', class: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
      embassy_processing: { label: 'Embassy Processing', class: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' },
      approved: { label: 'Approved', class: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
      issued: { label: 'Issued & Ready', class: 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-200' },
      rejected: { label: 'Refused', class: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' },
      on_hold: { label: 'On Hold', class: 'bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200' },
    };
    const conf = map[status] || { label: status, class: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${conf.class}`}>
        {conf.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Worldwide Visa & Consular Services
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                190+ Destinations
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl">
              End-to-end visa applications, consular embassy filing, real-time stage milestones, and automated biometric appointment schedules.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setPreSelectedCountryCode(undefined);
                setIsApplyModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center space-x-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Worldwide Visa</span>
            </button>
          </div>
        </div>

        {/* Subtle background world map accents */}
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Globe className="w-72 h-72 text-blue-300" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Applications</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">All Travel Missions</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Under Review / Embassy</p>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats.underReview}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">Active Consular Dossier</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Biometrics Scheduled</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.biometrics}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">VFS / Embassy Slots</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Issued & Cleared</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.completed}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Delivered to Clients</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Navigation Tabs & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 pt-3 pb-3 gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'applications'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Active Applications & Timeline Tracker ({displayApplications.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Worldwide Country Directory & Fees ({WORLD_VISA_COUNTRIES.length})
            </button>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search country, applicant, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Region & Status Filters */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Regions */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-semibold mr-1">Region:</span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRegion === reg
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {reg === 'all' ? 'All Global Regions' : reg}
              </button>
            ))}
          </div>

          {/* Status Filter (for applications tab) */}
          {activeTab === 'applications' && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-semibold">Stage:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="py-1 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Stages</option>
                <option value="documents_verification">Dossier Intake</option>
                <option value="biometrics_appointment">Biometrics Scheduled</option>
                <option value="embassy_processing">Embassy Processing</option>
                <option value="approved">Approved</option>
                <option value="issued">Issued</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: Applications & Timeline Cards */}
        {activeTab === 'applications' && (
          <div className="p-6">
            {displayApplications.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mx-auto">
                  <Plane className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No Visa Applications Found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Start by selecting any of the 190+ countries to submit a client visa dossier with automated tracking.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPreSelectedCountryCode(undefined);
                    setIsApplyModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  Apply for Worldwide Visa
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayApplications.map((app) => {
                  const latestTimeline = app.timeline[app.timeline.length - 1];
                  return (
                    <div
                      key={app.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850/60 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{app.targetCountryFlag || '🌍'}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {app.targetCountry}
                              </h3>
                              <span className="text-xs font-mono font-semibold text-slate-400">
                                #{app.applicationNumber}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {app.visaType} ({app.entryType})
                            </p>
                          </div>
                        </div>
                        <div>{getStatusBadge(app.status)}</div>
                      </div>

                      {/* Progress Bar & Current Stage */}
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {app.currentStageTitle || app.status.replace(/_/g, ' ')}
                          </span>
                          <span className="font-bold font-mono text-blue-600 dark:text-blue-400">
                            {app.progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              app.status === 'issued' || app.status === 'approved'
                                ? 'bg-emerald-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.max(5, app.progressPercentage)}%` }}
                          />
                        </div>
                        {latestTimeline?.actionRequired && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium pt-1">
                            ⚠️ Next: {latestTimeline.actionRequired}
                          </p>
                        )}
                      </div>

                      {/* Client & Metadata Details */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Applicant:</span>
                          <span className="font-semibold">{app.clientName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Passport No:</span>
                          <span className="font-mono font-semibold">{app.clientPassportNo}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Travel Date:</span>
                          <span className="font-semibold">{app.travelDate || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Total Cleared Fee:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                            AED {app.totalAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] text-slate-400">
                          Officer: <span className="font-medium text-slate-600 dark:text-slate-300">{app.assignedOfficerName || 'Assigned PRO'}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!isClientRole && (
                            <button
                              onClick={() => deleteVisaApplication(app.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete Application"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setTimelineModalApp(app)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold flex items-center space-x-1 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Timeline & Dossier</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Worldwide Country Directory & Catalog */}
        {activeTab === 'catalog' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalogCountries.map((country) => (
                <div
                  key={country.countryCode}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850/60 p-5 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{country.flag}</span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {country.countryName}
                          </h3>
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                            {country.region}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {country.visaTypes.length} Visa Options
                      </span>
                    </div>

                    {/* Visa Types Pills */}
                    <div className="space-y-2 pt-1">
                      {country.visaTypes.slice(0, 2).map((vt) => (
                        <div
                          key={vt.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{vt.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {vt.validityDuration} | {vt.standardDays} Days
                            </p>
                          </div>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            AED {(vt.standardGovFee + vt.standardServiceFee).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenApplyForCountry(country.countryCode)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all"
                    >
                      <span>Apply for {country.countryName} Visa</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visa Application Modal */}
      {isApplyModalOpen && (
        <VisaApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          preSelectedCountryCode={preSelectedCountryCode}
        />
      )}

      {/* Visa Timeline & Dossier Modal */}
      {timelineModalApp && (
        <VisaTimelineModal
          isOpen={Boolean(timelineModalApp)}
          onClose={() => setTimelineModalApp(null)}
          application={
            visaApplications.find((a) => a.id === timelineModalApp.id) || timelineModalApp
          }
        />
      )}
    </div>
  );
};
