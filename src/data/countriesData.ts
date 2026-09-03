export interface VisaCountryOption {
  countryCode: string;
  countryName: string;
  flag: string;
  region: 'GCC & Middle East' | 'Europe & Schengen' | 'Americas' | 'Asia-Pacific' | 'Africa & Global';
  popular?: boolean;
  visaTypes: {
    id: string;
    name: string;
    category: 'Tourist / Visit Visa' | 'Golden / Investor Visa' | 'Work / Employment Permit' | 'Business Visa' | 'Student Visa' | 'Digital Nomad';
    entryType: 'Single Entry' | 'Multiple Entry';
    validityDuration: string;
    stayDuration: string;
    standardGovFee: number; // in AED
    standardServiceFee: number; // in AED
    standardDays: number;
    expressDays: number;
    expressSurcharge: number;
    superExpressAvailable?: boolean;
    requiredDocuments: string[];
    description: string;
  }[];
}

export const WORLD_VISA_COUNTRIES: VisaCountryOption[] = [];
