import React, { useState, useEffect } from 'react';
import { X, Globe, Save, Sparkles, MapPin } from 'lucide-react';
import { VisaCountryOption } from '../../data/countriesData';

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

export const EditVisaCountryModal: React.FC<EditVisaCountryModalProps> = ({
  isOpen,
  onClose,
  countryToEdit,
  onSave,
}) => {
  const isEditing = Boolean(countryToEdit);

  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [flag, setFlag] = useState('🌍');
  const [region, setRegion] = useState<VisaCountryOption['region']>('Europe & Schengen');
  const [popular, setPopular] = useState(false);

  useEffect(() => {
    if (countryToEdit) {
      setCountryCode(countryToEdit.countryCode);
      setCountryName(countryToEdit.countryName);
      setFlag(countryToEdit.flag);
      setRegion(countryToEdit.region);
      setPopular(Boolean(countryToEdit.popular));
    } else {
      setCountryCode('');
      setCountryName('');
      setFlag('🌍');
      setRegion('Europe & Schengen');
      setPopular(false);
    }
  }, [countryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryCode.trim() || !countryName.trim()) return;

    const savedCountry: VisaCountryOption = {
      countryCode: countryCode.trim().toUpperCase(),
      countryName: countryName.trim(),
      flag: flag.trim() || '🌍',
      region,
      popular,
      visaTypes: countryToEdit?.visaTypes && countryToEdit.visaTypes.length > 0
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
                'Valid Passport Copy (6+ months)',
                'Passport Size Photograph',
                'Hotel / Itinerary Booking',
              ],
              description: `Standard consular visa processing for travel to ${countryName.trim()}.`,
            },
          ],
    };

    onSave(savedCountry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Country Destination' : 'Add New Worldwide Country'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Directory & Consular Service Registry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Flag Emoji
              </label>
              <input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="🇫🇷, 🇺🇸"
                className="w-full py-2 px-3 text-center text-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                ISO Country Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                disabled={isEditing}
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                placeholder="e.g. FR, IT, US, JP"
                className="w-full py-2 px-3 text-xs uppercase font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-60"
              />
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
              onChange={(e) => setCountryName(e.target.value)}
              placeholder="e.g. France, Germany, Japan, United States..."
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
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {REGION_OPTIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id="popularCountryCheck"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="popularCountryCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pin as Featured / Popular Destination
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/25 transition-all"
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
