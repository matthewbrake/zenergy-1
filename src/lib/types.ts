import { z } from 'zod';

export const ProspectSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  phone: z.string().min(10, 'Please enter a valid phone number').regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
});

export type ProspectData = z.infer<typeof ProspectSchema>;

export interface AddressData {
  placeId: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

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
  // Other financing options can be added here
};

// Directly maps to the Solar API's SolarPotential sub-object
export type SolarPotentialAssessmentOutput = {
  maxArrayPanelsCount?: number;
  maxSunshineHoursPerYear?: number;
  carbonOffsetFactorKgPerMwh?: number;
  yearlyEnergyDcKwh?: number;
  financialAnalysis?: FinancialAnalysis; 
  sunshineQuantiles?: number[];
  imageryDate?: any;
  imageryProcessedDate?: any;
  imageryQuality?: string;
  panelLifetimeYears?: number;
};

// Directly maps to the Solar API's dataLayers response
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


export type AnalysisResult = {
  potential: SolarPotentialAssessmentOutput;
  visualization: VisualizeSolarDataLayersOutput;
};

// Types for GeoTIFF rendering
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
