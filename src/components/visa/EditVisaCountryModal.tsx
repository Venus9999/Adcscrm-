import React, { useState, useEffect } from 'react';
import { X, Globe, Save, Sparkles, Search, Check, Info } from 'lucide-react';
import { VisaCountryOption } from '../../data/countriesData';
import {
  parseEmojiOrCode,
  countryCodeToFlagEmoji,
  WORLD_COUNTRIES_CATALOG,
  findMatchingCountries,
  CountryCatalogItem,
} from '../../utils/countryFlagUtils';
import { CountryFlag } from './CountryFlag';

interface EditVisaCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryToEdit?: VisaCountryOption | null;
  onSave: (country: VisaCountryOption) => void;
}

const REGION_OPTIONS: VisaCountryOption['region'][] = [
  'GCC & Middle East',
  'Europe & Schengen',
  'Americas',
  'Asia-Pacific',
  'Africa & Global',
];

const POPULAR_QUICK_FLAGS = [
  { code: 'AE', name: 'UAE', flag: '🇦🇪', region: 'GCC & Middle East' as const },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'GCC & Middle East' as const },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe & Schengen' as const },
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas' as const },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe & Schengen' as const },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe & Schengen' as const },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'Europe & Schengen' as const },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe & Schengen' as const },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia-Pacific' as const },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas' as const },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia-Pacific' as const },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia-Pacific' as const },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia-Pacific' as const },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Europe & Schengen' as const },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', region: 'GCC & Middle East' as const },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', region: 'GCC & Middle East' as const },
];

export const EditVisaCountryModal: React.FC<EditVisaCountryModalProps> = ({
  isOpen,
  onClose,
  countryToEdit,
  onSave,
}) => {
  const isEditing = Boolean(countryToEdit);

  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [rawFlagInput, setRawFlagInput] = useState('🌍');
  const [resolvedFlag, setResolvedFlag] = useState('🌍');
  const [region, setRegion] = useState<VisaCountryOption['region']>('Europe & Schengen');
  const [popular, setPopular] = useState(false);
  const [showCatalogSearch, setShowCatalogSearch] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');

  // Synchronize on open or change
  useEffect(() => {
    if (countryToEdit) {
      setCountryCode(countryToEdit.countryCode);
      setCountryName(countryToEdit.countryName);
      setRawFlagInput(countryToEdit.flag);
      setResolvedFlag(countryToEdit.flag);
      setRegion(countryToEdit.region);
      setPopular(Boolean(countryToEdit.popular));
    } else {
      setCountryCode('');
      setCountryName('');
      setRawFlagInput('🌍');
      setResolvedFlag('🌍');
      setRegion('Europe & Schengen');
      setPopular(false);
    }
    setShowCatalogSearch(false);
    setCatalogQuery('');
  }, [countryToEdit, isOpen]);

  // Handle Flag Input parsing (e.g. user types emoji, shortcode :us:, ISO code US, unicode hex U+1F1FA)
  const handleFlagInputChange = (inputVal: string) => {
    setRawFlagInput(inputVal);
    const parsed = parseEmojiOrCode(inputVal, countryCode);
    if (parsed.valid && parsed.flag) {
      setResolvedFlag(parsed.flag);
      if (!countryCode && parsed.countryCode) {
        setCountryCode(parsed.countryCode);
      }
    } else if (inputVal.trim()) {
      setResolvedFlag(inputVal.trim());
    } else {
      setResolvedFlag('🌍');
    }
  };

  // Handle Country Code Change & Auto-Resolve Flag
  const handleCountryCodeChange = (codeVal: string) => {
    const clean = codeVal.toUpperCase().slice(0, 5);
    setCountryCode(clean);

    if (clean.length === 2 && /^[A-Z]{2}$/.test(clean)) {
      const generatedFlag = countryCodeToFlagEmoji(clean);
      setResolvedFlag(generatedFlag);
      setRawFlagInput(generatedFlag);

      // Check if catalog has metadata for this country
      const match = WORLD_COUNTRIES_CATALOG.find((c) => c.code === clean);
      if (match) {
        if (!countryName || countryName === '') {
          setCountryName(match.name);
        }
        setRegion(match.region);
      }
    }
  };

  // Handle Country Name Change with intelligent autocomplete
  const handleCountryNameChange = (nameVal: string) => {
    setCountryName(nameVal);

    if (!isEditing && (!countryCode || countryCode.length < 2)) {
      const match = WORLD_COUNTRIES_CATALOG.find(
        (c) =>
          c.name.toLowerCase() === nameVal.trim().toLowerCase() ||
          c.aliases?.some((a) => a.toLowerCase() === nameVal.trim().toLowerCase())
      );
      if (match) {
        setCountryCode(match.code);
        setResolvedFlag(match.flag);
        setRawFlagInput(match.flag);
        setRegion(match.region);
      }
    }
  };

  // Select a country from quick presets or search catalog
  const handleSelectCountryPreset = (item: CountryCatalogItem | typeof POPULAR_QUICK_FLAGS[number]) => {
    if (!isEditing) {
      setCountryCode(item.code);
    }
    setCountryName(item.name);
    setResolvedFlag(item.flag);
    setRawFlagInput(item.flag);
    setRegion(item.region);
    setShowCatalogSearch(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryCode.trim() || !countryName.trim()) return;

    // Ensure final flag is parsed
    const parsed = parseEmojiOrCode(rawFlagInput, countryCode);
    const finalFlag = parsed.flag || resolvedFlag || countryCodeToFlagEmoji(countryCode) || '🌍';

    const savedCountry: VisaCountryOption = {
      countryCode: countryCode.trim().toUpperCase(),
      countryName: countryName.trim(),
      flag: finalFlag,
      region,
      popular,
      visaTypes:
        countryToEdit?.visaTypes && countryToEdit.visaTypes.length > 0
          ? countryToEdit.visaTypes
          : [
              {
                id: `${countryCode.toLowerCase()}-tourist-std`,
                name: 'Standard Tourist / Visit Visa',
                category: 'Tourist / Visit Visa',
                entryType: 'Single Entry',
                validityDuration: '90 Days',
                stayDuration: '30 Days',
                standardGovFee: 350,
                standardServiceFee: 150,
                standardDays: 3,
                expressDays: 1,
                expressSurcharge: 180,
                superExpressAvailable: true,
                requiredDocuments: [
                  'Valid Passport Copy (6+ months validity)',
                  'Recent Passport Size Photograph (White Background)',
                  'Confirmed Return Flight / Hotel Booking',
                ],
                description: `Standard consular visa processing for tourism and leisure travel to ${countryName.trim()}.`,
              },
            ],
    };

    onSave(savedCountry);
    onClose();
  };

  const filteredCatalog = findMatchingCountries(catalogQuery);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Country Destination' : 'Add New Worldwide Country'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Worldwide Visa & Consular Registry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Quick Flag & Search Trigger */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Quick Flag & Country Selector</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </span>
            <button
              type="button"
              onClick={() => setShowCatalogSearch(!showCatalogSearch)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{showCatalogSearch ? 'Hide Country Search' : 'Browse All 190+ Countries'}</span>
            </button>
          </div>

          {/* Quick Country Badges */}
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 max-h-24 overflow-y-auto">
            {POPULAR_QUICK_FLAGS.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectCountryPreset(item)}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  countryCode === item.code
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
                title={`${item.name} (${item.code})`}
              >
                <CountryFlag countryCode={item.code} flag={item.flag} size="xs" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Searchable Catalog Drawer */}
          {showCatalogSearch && (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800/60 space-y-2 animate-in fade-in duration-150">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={catalogQuery}
                  onChange={(e) => setCatalogQuery(e.target.value)}
                  placeholder="Search country name, ISO code, or emoji shortcode..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1">
                {filteredCatalog.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCountryPreset(c)}
                    className="p-1.5 rounded-lg text-left text-xs bg-white dark:bg-slate-800 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <CountryFlag countryCode={c.code} flag={c.flag} size="xs" />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flag Preview & Input Fields */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Flag Preview & Parsing</span>
              <span className="text-[10px] text-slate-400">High-Res Flag + Unicode Emoji</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-14 h-10 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
                <CountryFlag countryCode={countryCode} flag={resolvedFlag} size="xl" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {countryName || 'New Destination'}
                  </span>
                  {countryCode && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {countryCode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Resolved Flag: <span className="font-emoji">{resolvedFlag}</span> • Region: {region}
                </p>
              </div>
            </div>
          </div>

          {/* Flag Emoji Input & Country Code Input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Flag Emoji / Code
              </label>
              <input
                type="text"
                value={rawFlagInput}
                onChange={(e) => handleFlagInputChange(e.target.value)}
                placeholder="🇫🇷, :us:, US"
                className="w-full py-2 px-3 text-center text-base rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                Emoji, ISO code, or shortcode
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ISO Country Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                disabled={isEditing}
                value={countryCode}
                onChange={(e) => handleCountryCodeChange(e.target.value)}
                placeholder="e.g. FR, IT, US, JP, IN"
                className="w-full py-2 px-3 text-xs uppercase font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
              />
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                Typing ISO code automatically resolves flag & name
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Destination Country Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={countryName}
              onChange={(e) => handleCountryNameChange(e.target.value)}
              placeholder="e.g. France, Germany, Japan, United States, India..."
              className="w-full py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Global Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as any)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
            >
              {REGION_OPTIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-1 flex items-center space-x-2">
            <input
              type="checkbox"
              id="popularCountryCheck"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="popularCountryCheck"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
            >
              Pin as Featured / Popular Destination on Dashboard
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Country Details' : 'Add Destination Country'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
