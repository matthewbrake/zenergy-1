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

// These types now reflect the structure of the direct Solar API response
// We'll keep them separate for clarity, even though they look similar to the old ones.
export type SolarPotentialAssessmentOutput = {
  maxArrayPanelsCount?: number;
  maxSunshineHoursPerYear?: number;
  yearlyEnergyDcKwh?: number;
  financialAnalysis?: any;
  sunshineQuantiles?: number[];
};

export type VisualizeSolarDataLayersOutput = {
  rgbImageryUrl?: string;
  digitalSurfaceModelUrl?: string;
  annualSolarFluxUrl?: string;
  monthlySolarFluxUrls?: string[];
  hourlyShadeUrls?: string[];
  buildingMaskUrl?: string;
};


export type AnalysisResult = {
  potential: SolarPotentialAssessmentOutput;
  visualization: VisualizeSolarDataLayersOutput;
};
