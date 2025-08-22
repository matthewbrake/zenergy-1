
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

// Directly maps to the Solar API's SolarPotential sub-object
export type SolarPotentialAssessmentOutput = {
  maxArrayPanelsCount?: number;
  maxSunshineHoursPerYear?: number;
  carbonOffsetFactorKgPerMwh?: number;
  yearlyEnergyDcKwh?: number;
  financialAnalysis?: any; // The structure is complex, using 'any' for now
  sunshineQuantiles?: number[];
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
