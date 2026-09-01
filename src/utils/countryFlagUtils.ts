/**
 * Comprehensive Country & Flag Utilities
 * Handles parsing emoji codes, shortcodes (:us:, :flag-in:, etc.), ISO codes (US, IN, AE),
 * Unicode codepoints (U+1F1FA, 1F1FA 1F1F8), and provides crisp visual flag rendering.
 */

export interface CountryCatalogItem {
  code: string;
  name: string;
  flag: string;
  region: 'GCC & Middle East' | 'Europe & Schengen' | 'Americas' | 'Asia-Pacific' | 'Africa & Global';
  aliases?: string[];
}

// Convert 2-letter ISO code (e.g. 'US', 'AE') to Unicode Flag Emoji ('🇺🇸', '🇦🇪')
export function countryCodeToFlagEmoji(countryCode: string): string {
  if (!countryCode) return '🌍';
  const clean = countryCode.trim().toUpperCase();
  if (clean.length === 2 && /^[A-Z]{2}$/.test(clean)) {
    const codePoints = [
      0x1f1e6 + clean.charCodeAt(0) - 65,
      0x1f1e6 + clean.charCodeAt(1) - 65,
    ];
    return String.fromCodePoint(...codePoints);
  }
  return '🌍';
}

// Convert Unicode Flag Emoji ('🇺🇸') back to 2-letter ISO code ('US')
export function flagEmojiToCountryCode(emoji: string): string {
  if (!emoji) return '';
  const codePoints = Array.from(emoji).map((c) => c.codePointAt(0) || 0);
  if (
    codePoints.length >= 2 &&
    codePoints[0] >= 0x1f1e6 &&
    codePoints[0] <= 0x1f1ff &&
    codePoints[1] >= 0x1f1e6 &&
    codePoints[1] <= 0x1f1ff
  ) {
    const char1 = String.fromCharCode(codePoints[0] - 0x1f1e6 + 65);
    const char2 = String.fromCharCode(codePoints[1] - 0x1f1e6 + 65);
    return `${char1}${char2}`;
  }
  return '';
}

// Comprehensive list of countries with codes, emojis, and regions
export const WORLD_COUNTRIES_CATALOG: CountryCatalogItem[] = [
  // GCC & Middle East
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'GCC & Middle East', aliases: ['UAE', 'Dubai', 'Abu Dhabi', ':ae:', ':flag-ae:', 'flag-ae'] },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', region: 'GCC & Middle East', aliases: ['KSA', ':sa:', ':flag-sa:', 'flag-sa'] },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', region: 'GCC & Middle East', aliases: ['Sultanate of Oman', ':om:', ':flag-om:', 'flag-om'] },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', region: 'GCC & Middle East', aliases: [':qa:', ':flag-qa:', 'flag-qa'] },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', region: 'GCC & Middle East', aliases: [':bh:', ':flag-bh:', 'flag-bh'] },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', region: 'GCC & Middle East', aliases: [':kw:', ':flag-kw:', 'flag-kw'] },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴', region: 'GCC & Middle East', aliases: [':jo:', ':flag-jo:', 'flag-jo'] },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧', region: 'GCC & Middle East', aliases: [':lb:', ':flag-lb:', 'flag-lb'] },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶', region: 'GCC & Middle East', aliases: [':iq:', ':flag-iq:'] },

  // Europe & Schengen
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe & Schengen', aliases: ['UK', 'Britain', 'Great Britain', 'England', ':gb:', ':uk:', ':flag-gb:', ':flag-uk:', 'flag-gb'] },
  { code: 'FR', name: 'France (Schengen)', flag: '🇫🇷', region: 'Europe & Schengen', aliases: ['France', ':fr:', ':flag-fr:', 'flag-fr'] },
  { code: 'DE', name: 'Germany (Schengen)', flag: '🇩🇪', region: 'Europe & Schengen', aliases: ['Germany', 'Deutschland', ':de:', ':flag-de:', 'flag-de'] },
  { code: 'IT', name: 'Italy (Schengen)', flag: '🇮🇹', region: 'Europe & Schengen', aliases: ['Italy', 'Italia', ':it:', ':flag-it:', 'flag-it'] },
  { code: 'ES', name: 'Spain (Schengen)', flag: '🇪🇸', region: 'Europe & Schengen', aliases: ['Spain', 'Espana', ':es:', ':flag-es:', 'flag-es'] },
  { code: 'CH', name: 'Switzerland (Schengen)', flag: '🇨🇭', region: 'Europe & Schengen', aliases: ['Switzerland', 'Swiss', ':ch:', ':flag-ch:', 'flag-ch'] },
  { code: 'NL', name: 'Netherlands (Schengen)', flag: '🇳🇱', region: 'Europe & Schengen', aliases: ['Netherlands', 'Holland', ':nl:', ':flag-nl:', 'flag-nl'] },
  { code: 'PT', name: 'Portugal (Schengen)', flag: '🇵🇹', region: 'Europe & Schengen', aliases: ['Portugal', ':pt:', ':flag-pt:', 'flag-pt'] },
  { code: 'GR', name: 'Greece (Schengen)', flag: '🇬🇷', region: 'Europe & Schengen', aliases: ['Greece', ':gr:', ':flag-gr:', 'flag-gr'] },
  { code: 'AT', name: 'Austria (Schengen)', flag: '🇦🇹', region: 'Europe & Schengen', aliases: ['Austria', ':at:', ':flag-at:', 'flag-at'] },
  { code: 'BE', name: 'Belgium (Schengen)', flag: '🇧🇪', region: 'Europe & Schengen', aliases: ['Belgium', ':be:', ':flag-be:', 'flag-be'] },
  { code: 'SE', name: 'Sweden (Schengen)', flag: '🇸🇪', region: 'Europe & Schengen', aliases: ['Sweden', ':se:', ':flag-se:', 'flag-se'] },
  { code: 'NO', name: 'Norway (Schengen)', flag: '🇳🇴', region: 'Europe & Schengen', aliases: ['Norway', ':no:', ':flag-no:', 'flag-no'] },
  { code: 'DK', name: 'Denmark (Schengen)', flag: '🇩🇰', region: 'Europe & Schengen', aliases: ['Denmark', ':dk:', ':flag-dk:', 'flag-dk'] },
  { code: 'FI', name: 'Finland (Schengen)', flag: '🇫🇮', region: 'Europe & Schengen', aliases: ['Finland', ':fi:', ':flag-fi:', 'flag-fi'] },
  { code: 'PL', name: 'Poland (Schengen)', flag: '🇵🇱', region: 'Europe & Schengen', aliases: ['Poland', ':pl:', ':flag-pl:', 'flag-pl'] },
  { code: 'CZ', name: 'Czech Republic (Schengen)', flag: '🇨🇿', region: 'Europe & Schengen', aliases: ['Czechia', ':cz:', ':flag-cz:', 'flag-cz'] },
  { code: 'HU', name: 'Hungary (Schengen)', flag: '🇭🇺', region: 'Europe & Schengen', aliases: ['Hungary', ':hu:', ':flag-hu:', 'flag-hu'] },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', region: 'Europe & Schengen', aliases: ['Ireland', ':ie:', ':flag-ie:', 'flag-ie'] },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Europe & Schengen', aliases: ['Turkiye', 'Turkey', ':tr:', ':flag-tr:', 'flag-tr'] },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿', region: 'Europe & Schengen', aliases: [':az:', ':flag-az:', 'flag-az'] },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪', region: 'Europe & Schengen', aliases: [':ge:', ':flag-ge:', 'flag-ge'] },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', region: 'Europe & Schengen', aliases: ['Russian Federation', ':ru:', ':flag-ru:', 'flag-ru'] },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾', region: 'Europe & Schengen', aliases: [':cy:', ':flag-cy:'] },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', region: 'Europe & Schengen', aliases: [':hr:', ':flag-hr:'] },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', region: 'Europe & Schengen', aliases: [':ro:', ':flag-ro:'] },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', region: 'Europe & Schengen', aliases: [':bg:', ':flag-bg:'] },

  // Americas
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'Americas', aliases: ['USA', 'United States of America', 'America', ':us:', ':usa:', ':flag-us:', ':flag-usa:', 'flag-us'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'Americas', aliases: ['Canada', ':ca:', ':flag-ca:', 'flag-ca'] },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'Americas', aliases: ['Mexico', ':mx:', ':flag-mx:', 'flag-mx'] },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'Americas', aliases: ['Brasil', ':br:', ':flag-br:', 'flag-br'] },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', region: 'Americas', aliases: [':ar:', ':flag-ar:'] },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', region: 'Americas', aliases: [':co:', ':flag-co:'] },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', region: 'Americas', aliases: [':cl:', ':flag-cl:'] },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', region: 'Americas', aliases: [':pe:', ':flag-pe:'] },

  // Asia-Pacific
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia-Pacific', aliases: ['India', 'Bharat', ':in:', ':flag-in:', 'flag-in'] },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', region: 'Asia-Pacific', aliases: ['Pakistan', ':pk:', ':flag-pk:', 'flag-pk'] },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', region: 'Asia-Pacific', aliases: [':bd:', ':flag-bd:', 'flag-bd'] },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', region: 'Asia-Pacific', aliases: [':lk:', ':flag-lk:'] },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', region: 'Asia-Pacific', aliases: [':np:', ':flag-np:'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia-Pacific', aliases: ['Singapore', ':sg:', ':flag-sg:', 'flag-sg'] },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia-Pacific', aliases: ['Nippon', ':jp:', ':flag-jp:', 'flag-jp'] },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia-Pacific', aliases: ["People's Republic of China', 'PRC", ':cn:', ':flag-cn:', 'flag-cn'] },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'Asia-Pacific', aliases: ['Korea', 'Republic of Korea', ':kr:', ':flag-kr:', 'flag-kr'] },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia-Pacific', aliases: ['Thailand', 'Siam', ':th:', ':flag-th:', 'flag-th'] },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia-Pacific', aliases: ['Malaysia', ':my:', ':flag-my:', 'flag-my'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia-Pacific', aliases: [':id:', ':flag-id:', 'flag-id'] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', region: 'Asia-Pacific', aliases: [':ph:', ':flag-ph:', 'flag-ph'] },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', region: 'Asia-Pacific', aliases: [':vn:', ':flag-vn:', 'flag-vn'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Asia-Pacific', aliases: ['Australia', 'Aussie', ':au:', ':flag-au:', 'flag-au'] },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'Asia-Pacific', aliases: ['New Zealand', 'Aotearoa', ':nz:', ':flag-nz:', 'flag-nz'] },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', region: 'Asia-Pacific', aliases: [':hk:', ':flag-hk:'] },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', region: 'Asia-Pacific', aliases: [':tw:', ':flag-tw:'] },

  // Africa & Global
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Africa & Global', aliases: ['Egypt', ':eg:', ':flag-eg:', 'flag-eg'] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa & Global', aliases: ['South Africa', ':za:', ':flag-za:', 'flag-za'] },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'Africa & Global', aliases: [':ke:', ':flag-ke:', 'flag-ke'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'Africa & Global', aliases: [':ng:', ':flag-ng:', 'flag-ng'] },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', region: 'Africa & Global', aliases: [':ma:', ':flag-ma:', 'flag-ma'] },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', region: 'Africa & Global', aliases: [':mu:', ':flag-mu:'] },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨', region: 'Africa & Global', aliases: [':sc:', ':flag-sc:'] },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', region: 'Africa & Global', aliases: [':tz:', ':flag-tz:'] },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', region: 'Africa & Global', aliases: [':et:', ':flag-et:'] },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', region: 'Africa & Global', aliases: [':gh:', ':flag-gh:'] },
];

/**
 * Parses any emoji input, emoji shortcode (e.g. :us:, :flag_in:, flag-ae),
 * Unicode codepoint sequence (e.g. U+1F1FA U+1F1F8, 1F1FA 1F1F8),
 * or ISO 2-letter code into a normalized emoji and country code.
 */
export function parseEmojiOrCode(
  input: string,
  fallbackIsoCode?: string
): { flag: string; countryCode: string; valid: boolean } {
  if (!input && !fallbackIsoCode) {
    return { flag: '🌍', countryCode: '', valid: false };
  }

  const raw = (input || '').trim();

  // 1. Direct 2-char Flag Emoji (Regional indicator sequence)
  const extractedIsoFromEmoji = flagEmojiToCountryCode(raw);
  if (extractedIsoFromEmoji) {
    return {
      flag: countryCodeToFlagEmoji(extractedIsoFromEmoji),
      countryCode: extractedIsoFromEmoji,
      valid: true,
    };
  }

  // 2. Check if input is a 2-letter ISO code directly (e.g. "US", "IN", "FR", "AE")
  if (/^[a-zA-Z]{2}$/.test(raw)) {
    const iso = raw.toUpperCase();
    return {
      flag: countryCodeToFlagEmoji(iso),
      countryCode: iso,
      valid: true,
    };
  }

  // 3. Check for Unicode hex formats: "U+1F1FA U+1F1F8" or "1F1FA 1F1F8" or "1F1FA-1F1F8" or "&#127462;&#127466;"
  const hexMatches = raw.match(/(?:U\+|0x|&#x|&#)?([0-9a-fA-F]{4,6})(?:;|)?/gi);
  if (hexMatches && hexMatches.length >= 2) {
    try {
      const cleanHexes = hexMatches.slice(0, 2).map((m) =>
        m.replace(/[^0-9a-fA-F]/g, '')
      );
      const cp1 = parseInt(cleanHexes[0], 16);
      const cp2 = parseInt(cleanHexes[1], 16);
      if (cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff && cp2 >= 0x1f1e6 && cp2 <= 0x1f1ff) {
        const emoji = String.fromCodePoint(cp1, cp2);
        const iso = flagEmojiToCountryCode(emoji);
        return { flag: emoji, countryCode: iso, valid: true };
      }
    } catch {}
  }

  // 4. Check for Slack/GitHub/Discord style emoji shortcodes:
  // e.g. ":us:", ":flag-us:", ":flag_in:", "flag-ae", ":united_states:", ":france:"
  const cleanShortcode = raw.toLowerCase().replace(/^:+|:+$/g, '').replace(/^flag[-_]/, '');
  if (/^[a-z]{2}$/.test(cleanShortcode)) {
    const iso = cleanShortcode.toUpperCase();
    return {
      flag: countryCodeToFlagEmoji(iso),
      countryCode: iso,
      valid: true,
    };
  }

  // 5. Match against catalog aliases & names
  const lowerRaw = raw.toLowerCase();
  const catalogMatch = WORLD_COUNTRIES_CATALOG.find((item) => {
    if (item.code.toLowerCase() === lowerRaw) return true;
    if (item.name.toLowerCase() === lowerRaw) return true;
    if (item.aliases?.some((a) => a.toLowerCase() === lowerRaw)) return true;
    return false;
  });

  if (catalogMatch) {
    return {
      flag: catalogMatch.flag,
      countryCode: catalogMatch.code,
      valid: true,
    };
  }

  // 6. If fallback ISO code is provided, use it
  if (fallbackIsoCode && /^[a-zA-Z]{2}$/.test(fallbackIsoCode.trim())) {
    const iso = fallbackIsoCode.trim().toUpperCase();
    return {
      flag: countryCodeToFlagEmoji(iso),
      countryCode: iso,
      valid: true,
    };
  }

  // 7. If raw string is already an emoji or custom string, return it
  if (raw) {
    return { flag: raw, countryCode: '', valid: true };
  }

  return { flag: '🌍', countryCode: '', valid: false };
}

/**
 * Returns a high-res SVG or PNG flag image URL via FlagCDN.
 * FlagCDN provides 100% reliable, ultra-crisp flags for all 250+ ISO country codes.
 */
export function getCountryFlagUrl(countryCodeOrEmoji: string): string | null {
  if (!countryCodeOrEmoji) return null;

  let iso = countryCodeOrEmoji.trim().toUpperCase();
  if (iso.length !== 2 || !/^[A-Z]{2}$/.test(iso)) {
    iso = flagEmojiToCountryCode(countryCodeOrEmoji);
  }

  if (iso && iso.length === 2 && /^[A-Z]{2}$/.test(iso)) {
    // Special handling for UK
    const lowerIso = iso.toLowerCase() === 'uk' ? 'gb' : iso.toLowerCase();
    return `https://flagcdn.com/w80/${lowerIso}.png`;
  }

  return null;
}

/**
 * Search helper for instant country autocomplete by name, code, or alias
 */
export function findMatchingCountries(query: string): CountryCatalogItem[] {
  if (!query) return WORLD_COUNTRIES_CATALOG.slice(0, 15);
  const q = query.trim().toLowerCase();
  return WORLD_COUNTRIES_CATALOG.filter((c) => {
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.aliases?.some((a) => a.toLowerCase().includes(q))
    );
  });
}
