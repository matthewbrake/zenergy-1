import { z } from 'zod';

// Zod schema for validating the prospect information form
export const ProspectSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  // Regex allows for common phone number formats
  phone: z.string().min(10, 'Please enter a valid phone number').regex(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
});

export type ProspectData = z.infer<typeof ProspectSchema>;

// Represents the data captured from the address autocomplete component
export interface AddressData {
  placeId: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

// Represents the data captured from the scheduling page
export interface AppointmentData {
  date: string; // e.g., "2024-10-26"
  time: string; // e.g., "10:00 AM"
}

// --- SOLAR API TYPES ---
// These types are structured to match the JSON responses from the Google Solar API.

export type Money = {
  currencyCode?: string;
  units?: number;
  nanos?: number;
};

export type SavingsOverTime = {
  savingsYear1?: Money;
  savingsYear20?: Money;
  presentValueOfSavingsYear20?: Money;
  savingsLifetime?: Money;
  presentValueOfSavingsLifetime?: Money;
  financiallyViable?: boolean;
};

export type CashPurchaseSavings = {
  outOfPocketCost?: Money;
  upfrontCost?: Money;
  rebateValue?: Money;
  savings?: SavingsOverTime;
  paybackYears?: number;
};

export type FinancialAnalysis = {
  monthlyBill?: Money;
  defaultBill?: boolean;
  averageKwhPerMonth?: number;
  cashPurchaseSavings?: CashPurchaseSavings;
  // Other financing options can be added here if needed
};

// Maps to the Solar API's SolarPotential sub-object from the `buildingInsights` endpoint
export type SolarPotentialAssessmentOutput = {
  maxArrayPanelsCount?: number;
  maxSunshineHoursPerYear?: number;
  carbonOffsetFactorKgPerMwh?: number;
  yearlyEnergyDcKwh?: number;
  financialAnalysis?: FinancialAnalysis; 
  solarPotential?: any; // To hold the full solar potential object for deeper analysis if needed
  sunshineQuantiles?: number[];
  imageryDate?: any;
  imageryProcessedDate?: any;
  imageryQuality?: string;
  panelLifetimeYears?: number;
};

// Maps to the Solar API's `dataLayers` endpoint response
export type VisualizeSolarDataLayersOutput = {
  rgbImageryUrl?: string;
  digitalSurfaceModelUrl?: string;
  annualSolarFluxUrl?: string;
  monthlySolarFluxUrls?: string[];
  hourlyShadeUrls?: string[];
  buildingMaskUrl?: string;
  boundingBox?: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  };
};

// The combined result passed to the solar report page
export type AnalysisResult = {
  potential: SolarPotentialAssessmentOutput;
  visualization: VisualizeSolarDataLayersOutput;
};

// Helper type for GeoTIFF rendering
export interface GeoTiffData {
  width: number;
  height: number;
  rasters: Array<number>[];
  bounds: {
    left: number;
    bottom: number;
    right: number;
    top: number;
  };
}
