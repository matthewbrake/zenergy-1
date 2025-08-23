
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

// This type maps to the full buildingInsights response, containing the solarPotential object.
export type BuildingInsights = {
    name: string;
    center: { latitude: number; longitude: number; };
    boundingBox: { sw: { latitude: number, longitude: number }, ne: { latitude: number, longitude: number }};
    imageryDate: { year: number; month: number; day: number; };
    imageryProcessedDate: { year: number; month: number; day: number; };
    imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
    solarPotential: {
        maxArrayPanelsCount: number;
        maxArrayAreaMeters2: number;
        maxSunshineHoursPerYear: number;
        carbonOffsetFactorKgPerMwh: number;
        wholeRoofStats: any; // Could be typed further
        roofSegmentStats: any[]; // Could be typed further
        solarPanelConfigs: any[]; // Could be typed further
        panelCapacityWatts: number;
        panelHeightMeters: number;
        panelWidthMeters: number;
        panelLifetimeYears: number;
        yearlyEnergyDcKwh: number;
        financialAnalyses: any[]; // Contains FinancialAnalysis objects
    }
}

// Maps to the Solar API's SolarPotential sub-object and includes the top-level financialAnalysis
export type SolarPotentialAssessmentOutput = {
  maxArrayPanelsCount?: number;
  maxSunshineHoursPerYear?: number;
  carbonOffsetFactorKgPerMwh?: number;
  yearlyEnergyDcKwh?: number;
  financialAnalysis?: FinancialAnalysis; 
  solarPotential?: BuildingInsights['solarPotential']; // The full, detailed solar potential object
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
  potential: SolarPotentialAssessmentOutput & { solarPotential: BuildingInsights['solarPotential'] }; // Ensure solarPotential is not optional here
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
