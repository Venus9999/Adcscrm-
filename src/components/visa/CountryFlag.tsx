import React, { useState } from 'react';
import { getCountryFlagUrl, parseEmojiOrCode } from '../../utils/countryFlagUtils';

interface CountryFlagProps {
  flag?: string;
  countryCode?: string;
  countryName?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showCodeBadge?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-4 h-3 text-xs',
  sm: 'w-5 h-3.5 text-sm',
  md: 'w-6 h-4 text-base',
  lg: 'w-8 h-5 text-xl',
  xl: 'w-10 h-7 text-2xl',
  '2xl': 'w-12 h-8 text-3xl',
  '3xl': 'w-14 h-9 text-4xl',
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  flag,
  countryCode,
  countryName,
  className = '',
  size = 'md',
  showCodeBadge = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Normalize flag and country code
  const parsed = parseEmojiOrCode(flag || '', countryCode);
  const resolvedFlag = parsed.flag || flag || '🌍';
  const resolvedCode = parsed.countryCode || countryCode || '';
  const flagUrl = getCountryFlagUrl(resolvedCode || resolvedFlag);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <span className={`inline-flex items-center gap-1.5 align-middle select-none shrink-0 ${className}`}>
      {flagUrl && !imgError ? (
        <span
          className={`inline-block overflow-hidden rounded-xs border border-slate-300/60 dark:border-slate-700/80 shadow-2xs ${sizeClass}`}
          title={countryName || resolvedCode || 'Country Flag'}
        >
          <img
            src={flagUrl}
            alt={countryName || resolvedCode || 'Flag'}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        </span>
      ) : (
        <span
          className={`inline-block leading-none ${sizeClass} flex items-center justify-center font-emoji`}
          title={countryName || resolvedCode}
        >
          {resolvedFlag}
        </span>
      )}

      {showCodeBadge && resolvedCode && (
        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
          {resolvedCode}
        </span>
      )}
    </span>
  );
};
