import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
  Send,
  RefreshCw,
  Zap,
  HelpCircle,
  Plane,
  ArrowRight,
  Info,
} from 'lucide-react';
import { fetchVisaCountryInsights, VisaInsightResponse } from '../../services/aiVisaService';
import { useCRM } from '../../context/CRMContext';

const POPULAR_DESTINATIONS = [
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', region: 'Middle East' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', region: 'Europe' },
  { name: 'United States', code: 'US', flag: '🇺🇸', region: 'North America' },
  { name: 'France (Schengen)', code: 'FR', flag: '🇫🇷', region: 'Schengen' },
  { name: 'Germany (Schengen)', code: 'DE', flag: '🇩🇪', region: 'Schengen' },
  { name: 'Spain (Schengen)', code: 'ES', flag: '🇪🇸', region: 'Schengen' },
  { name: 'Italy (Schengen)', code: 'IT', flag: '🇮🇹', region: 'Schengen' },
  { name: 'Switzerland (Schengen)', code: 'CH', flag: '🇨🇭', region: 'Schengen' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'North America' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', region: 'Middle East' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'Asia' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Europe/Asia' },
  { name: 'Oman', code: 'OM', flag: '🇴🇲', region: 'Middle East' },
  { name: 'Qatar', code: 'QA', flag: '🇶🇦', region: 'Middle East' },
];

const NATIONALITIES = [
  'United Arab Emirates',
  'India',
  'Pakistan',
  'Egypt',
  'Philippines',
  'United Kingdom',
  'United States',
  'Russia',
  'Canada',
  'Jordan',
  'Lebanon',
  'Saudi Arabia',
  'Syria',
  'Bangladesh',
  'Nigeria',
  'South Africa',
  'Germany',
  'France',
  'China',
  'Australia',
];

const VISA_TYPES = [
  'Tourist / Visitor Visa',
  'Business / Conference Visa',
  'Investor / Golden Residency Visa',
  'Employment / Work Permit',
  'Student / Academic Visa',
  'Family Reunion / Dependent Visa',
  'Transit Visa',
];

interface AIVisaCountryAdvisorProps {
  initialDestination?: string;
  initialNationality?: string;
  initialVisaType?: string;
  compact?: boolean;
  onApplyVisa?: (countryName: string, visaType: string) => void;
}

export const AIVisaCountryAdvisor: React.FC<AIVisaCountryAdvisorProps> = ({
  initialDestination = 'United Arab Emirates',
  initialNationality = 'India',
  initialVisaType = 'Tourist / Visitor Visa',
  compact = false,
  onApplyVisa,
}) => {
  const { currentUser } = useCRM();

  const [destination, setDestination] = useState(initialDestination);
  const [nationality, setNationality] = useState(
    (currentUser as any)?.nationality || initialNationality || 'India'
  );
  const [residence, setResidence] = useState('United Arab Emirates');
  const [visaType, setVisaType] = useState(initialVisaType);
  const [customQuestion, setCustomQuestion] = useState('');

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<VisaInsightResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'checklist' | 'processing' | 'tips' | 'sources' | 'qa'>('checklist');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const loadInsights = useCallback(
    async (query?: string) => {
      setLoading(true);
      try {
        const data = await fetchVisaCountryInsights({
          destinationCountry: destination,
          applicantNationality: nationality,
          visaType,
          currentResidence: residence,
          customQuery: query || customQuestion,
        });
        setInsights(data);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    },
    [destination, nationality, visaType, residence, customQuestion]
  );

  useEffect(() => {
    loadInsights();
  }, [destination, nationality, visaType, residence]);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    loadInsights(customQuestion.trim());
    setActiveTab('qa');
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div
      id="ai-visa-country-advisor"
      className={`bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">AI Visa Country Advisor</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Google Search Grounded (2026 Rules)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time official visa requirements, embassy wait times, fee structures, and document advisory
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadInsights()}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Re-verify Rules</span>
          </button>

          {onApplyVisa && (
            <button
              type="button"
              onClick={() => onApplyVisa(destination, visaType)}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Apply for {destination}</span>
            </button>
          )}
        </div>
      </div>

      {/* Country & Applicant Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
        {/* Destination Country */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Destination Country
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
          >
            {POPULAR_DESTINATIONS.map((c) => (
              <option key={c.code} value={c.name} className="bg-slate-900 text-white">
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Applicant Nationality */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Passport / Nationality
          </label>
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
          >
            {NATIONALITIES.map((n) => (
              <option key={n} value={n} className="bg-slate-900 text-white">
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Current Residence */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Applying From (Residence)
          </label>
          <select
            value={residence}
            onChange={(e) => setResidence(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
          >
            <option value="United Arab Emirates" className="bg-slate-900 text-white">
              🇦🇪 United Arab Emirates (UAE Resident)
            </option>
            <option value="Saudi Arabia" className="bg-slate-900 text-white">
              🇸🇦 Saudi Arabia (KSA)
            </option>
            <option value="Qatar" className="bg-slate-900 text-white">
              🇶🇦 Qatar
            </option>
            <option value="Home Country" className="bg-slate-900 text-white">
              🌍 Home Country (Direct Embassy)
            </option>
          </select>
        </div>

        {/* Visa Category */}
        <div>
          <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
            Visa Category
          </label>
          <select
            value={visaType}
            onChange={(e) => setVisaType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
          >
            {VISA_TYPES.map((v) => (
              <option key={v} value={v} className="bg-slate-900 text-white">
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Destination Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Popular:
        </span>
        {POPULAR_DESTINATIONS.slice(0, 8).map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setDestination(c.name)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer ${
              destination === c.name
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
            }`}
          >
            {c.flag} {c.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Live Stats Overview Card */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          <div className="p-3.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Processing Duration</p>
              <p className="text-xs font-bold text-white mt-0.5">{insights.processingTime}</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Estimated Fees</p>
              <p className="text-xs font-bold text-white mt-0.5">{insights.estimatedFees}</p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/70 border border-slate-700/80 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Submission Channel</p>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{insights.embassyAndPortals}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 mt-4">
        <button
          type="button"
          onClick={() => setActiveTab('checklist')}
          className={`pb-2.5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'checklist'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Mandatory Checklist</span>
          {insights?.keyRequirements && (
            <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] text-slate-300 rounded-full">
              {insights.keyRequirements.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tips')}
          className={`pb-2.5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'tips'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PRO Advice & Pitfalls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sources')}
          className={`pb-2.5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sources'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Verified Sources & Citations</span>
          {insights?.sources && (
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-[10px] text-emerald-300 rounded-full">
              {insights.sources.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('qa')}
          className={`pb-2.5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'qa'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Custom Q&A</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="py-4 min-h-[220px]">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
            <p className="text-sm font-bold text-white">
              Searching Google & Immigration Portals for {destination}...
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Analyzing latest 2026 entry rules, appointment slots, and documentation criteria for {nationality} passport holders.
            </p>
          </div>
        ) : (
          <>
            {/* Checklist Tab */}
            {activeTab === 'checklist' && insights && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-300 font-medium">
                    Check off documents as you prepare your application file:
                  </p>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {Object.values(checkedItems).filter(Boolean).length} / {insights.keyRequirements.length} Ready
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {insights.keyRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        checkedItems[idx]
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/70 text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          checkedItems[idx]
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {checkedItems[idx] && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <p className="text-xs font-medium leading-relaxed">{req}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips & Avoid Rejection Tab */}
            {activeTab === 'tips' && insights && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs">
                    Consular officers inspect financial credibility and intent to return. Follow these key PRO recommendations to ensure approval.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {insights.importantTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-800/60 border border-slate-700/70 rounded-xl flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources & Citations Tab */}
            {activeTab === 'sources' && insights && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Grounding sources retrieved from Google Search and official consular channels:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {insights.sources && insights.sources.length > 0 ? (
                    insights.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl transition-all flex items-center justify-between group"
                      >
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {src.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{src.url}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0 ml-2" />
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No external citations found.</p>
                  )}
                </div>

                {insights.searchQueries && insights.searchQueries.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Grounding Queries Run:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {insights.searchQueries.map((q, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-800 text-[11px] text-slate-300 rounded-md border border-slate-700/60"
                        >
                          🔍 {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom Q&A Tab */}
            {activeTab === 'qa' && (
              <div className="space-y-3">
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={`Ask anything about ${destination} visa (e.g. Can I transit without visa? Minimum salary in UAE?)`}
                    className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={loading || !customQuestion.trim()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Search AI</span>
                  </button>
                </form>

                {insights?.summary && (
                  <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs text-slate-200 space-y-2 leading-relaxed">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Verified Immigration Response</span>
                    </div>
                    <div className="whitespace-pre-line text-slate-300">{insights.summary}</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Grounding verified with Google Search • Official rules may change per consulate discretion.</span>
        </div>
        <span className="font-semibold text-slate-400">ADCS Global Immigration AI</span>
      </div>
    </div>
  );
};
