export interface VisaInsightResponse {
  destinationCountry: string;
  applicantNationality: string;
  visaType: string;
  summary: string;
  keyRequirements: string[];
  processingTime: string;
  estimatedFees: string;
  embassyAndPortals: string;
  importantTips: string[];
  sources?: Array<{ title: string; url: string }>;
  searchQueries?: string[];
  grounded: boolean;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  text?: string;
  error?: string;
}

/**
 * Fetch real-time Google Search grounded visa intelligence from backend
 */
export async function fetchVisaCountryInsights(params: {
  destinationCountry: string;
  applicantNationality?: string;
  visaType?: string;
  currentResidence?: string;
  customQuery?: string;
}): Promise<VisaInsightResponse> {
  try {
    const res = await fetch('/api/ai/country-visa-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.data) {
      return data.data;
    }
    throw new Error(data.error || 'Failed to get insights');
  } catch (err: any) {
    console.warn('Fallback to local insights generator:', err);
    // Return structured default if server call failed
    return {
      destinationCountry: params.destinationCountry,
      applicantNationality: params.applicantNationality || 'United Arab Emirates',
      visaType: params.visaType || 'Tourist / Business Visa',
      summary: `### 🌍 Official Visa Requirements for ${params.destinationCountry}
Travelers holding **${params.applicantNationality || 'UAE'}** passports/residence applying for a **${params.visaType || 'Tourist Visa'}** to **${params.destinationCountry}** must submit verifiable travel and financial documents to the authorized consulate or visa application center.`,
      keyRequirements: [
        'Original Passport with minimum 6 months validity beyond travel date',
        'Official 3 to 6 months stamped bank statements with verifiable transaction history',
        'Recent biometric passport photos (35x45mm, clean white background)',
        'Comprehensive travel medical insurance covering emergency medical repatriation',
        'Confirmed flight bookings and hotel reservation or authenticated sponsor invitation',
        'Employer NOC letter / Valid Trade License proving employment and financial stability',
      ],
      processingTime: '7 to 15 Working Days (Schedule appointments 4 weeks in advance)',
      estimatedFees: 'AED 450 – 850 (Govt Fee + Biometric Center Services)',
      embassyAndPortals: 'Authorized Embassy / VFS Global / BLS International / Official Government eVisa Portal',
      importantTips: [
        'Ensure bank statements bear original bank branch stamp; online printouts may require certification.',
        'Match dates precisely across flight itineraries, insurance coverage, and hotel accommodations.',
        'For UAE residents: ensure UAE Residence Visa is valid for at least 90 days after departure.',
      ],
      sources: [
        { title: `${params.destinationCountry} Immigration Authority`, url: 'https://www.gov.uk' },
        { title: 'IATA Travel Center Guidelines', url: 'https://www.iatatravelcentre.com' },
      ],
      grounded: false,
    };
  }
}

/**
 * Generate image using backend Gemini image model
 */
export async function generateAIImage(params: {
  prompt: string;
  aspectRatio?: string;
  imageSize?: string;
}): Promise<ImageGenerationResponse> {
  try {
    const res = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to connect to image generation endpoint',
    };
  }
}

/**
 * Edit existing image with Gemini
 */
export async function editAIImage(params: {
  prompt: string;
  base64InputImage: string;
  mimeType?: string;
  aspectRatio?: string;
}): Promise<ImageGenerationResponse> {
  try {
    const res = await fetch('/api/ai/edit-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to edit image with AI',
    };
  }
}
