import { z } from 'zod';

// List of US States for dropdown
export const US_STATES = [
    { name: 'Alabama', abbreviation: 'AL' },
    { name: 'Alaska', abbreviation: 'AK' },
    { name: 'Arizona', abbreviation: 'AZ' },
    { name: 'Arkansas', abbreviation: 'AR' },
    { name: 'California', abbreviation: 'CA' },
    { name: 'Colorado', abbreviation: 'CO' },
    { name: 'Connecticut', abbreviation: 'CT' },
    { name: 'Delaware', abbreviation: 'DE' },
    { name: 'Florida', abbreviation: 'FL' },
    { name: 'Georgia', abbreviation: 'GA' },
    { name: 'Hawaii', abbreviation: 'HI' },
    { name: 'Idaho', abbreviation: 'ID' },
    { name: 'Illinois', abbreviation: 'IL' },
    { name: 'Indiana', abbreviation: 'IN' },
    { name: 'Iowa', abbreviation: 'IA' },
    { name: 'Kansas', abbreviation: 'KS' },
    { name: 'Kentucky', abbreviation: 'KY' },
    { name: 'Louisiana', abbreviation: 'LA' },
    { name: 'Maine', abbreviation: 'ME' },
    { name: 'Maryland', abbreviation: 'MD' },
    { name: 'Massachusetts', abbreviation: 'MA' },
    { name: 'Michigan', abbreviation: 'MI' },
    { name: 'Minnesota', abbreviation: 'MN' },
    { name: 'Mississippi', abbreviation: 'MS' },
    { name: 'Missouri', abbreviation: 'MO' },
    { name: 'Montana', abbreviation: 'MT' },
    { name: 'Nebraska', abbreviation: 'NE' },
    { name: 'Nevada', abbreviation: 'NV' },
    { name: 'New Hampshire', abbreviation: 'NH' },
    { name: 'New Jersey', abbreviation: 'NJ' },
    { name: 'New Mexico', abbreviation: 'NM' },
    { name: 'New York', abbreviation: 'NY' },
    { name: 'North Carolina', abbreviation: 'NC' },
    { name: 'North Dakota', abbreviation: 'ND' },
    { name: 'Ohio', abbreviation: 'OH' },
    { name: 'Oklahoma', abbreviation: 'OK' },
    { name: 'Oregon', abbreviation: 'OR' },
    { name: 'Pennsylvania', abbreviation: 'PA' },
    { name: 'Rhode Island', abbreviation: 'RI' },
    { name: 'South Carolina', abbreviation: 'SC' },
    { name: 'South Dakota', abbreviation: 'SD' },
    { name: 'Tennessee', abbreviation: 'TN' },
    { name: 'Texas', abbreviation: 'TX' },
    { name: 'Utah', abbreviation: 'UT' },
    { name: 'Vermont', abbreviation: 'VT' },
    { name: 'Virginia', abbreviation: 'VA' },
    { name: 'Washington', abbreviation: 'WA' },
    { name: 'West Virginia', abbreviation: 'WV' },
    { name: 'Wisconsin', abbreviation: 'WI' },
    { name: 'Wyoming', abbreviation: 'WY' },
];

// Zod schema for validating the prospect information form
export const ProspectSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').regex(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Street address is required'),
  zipCode: z.string().min(5, 'A valid zip code is required'),
  state: z.string().min(1, 'Please select a state'),
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

// --- SOLAR API TYPES (Aligned with user-provided reference) ---

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Date {
  year: number;
  month: number;
  day: number;
}

export interface LatLngBox {
  sw: LatLng;
  ne: LatLng;
}

export interface DataLayersResponse {
  imageryDate: Date;
  imageryProcessedDate: Date;
  dsmUrl: string;
  rgbUrl: string;
  maskUrl: string;
  annualFluxUrl: string;
  monthlyFluxUrl: string;
  hourlyShadeUrls: string[];
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  boundingBox: LatLngBox;
}

export interface SizeAndSunshineStats {
  areaMeters2: number;
  sunshineQuantiles: number[];
  groundAreaMeters2: number;
}

export interface RoofSegmentSizeAndSunshineStats {
  pitchDegrees: number;
  azimuthDegrees: number;
  stats: SizeAndSunshineStats;
  center: LatLng;
  boundingBox: LatLngBox;
  planeHeightAtCenterMeters: number;
}

export interface SolarPanel {
  center: LatLng;
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  segmentIndex: number;
  yearlyEnergyDcKwh: number;
}

export interface RoofSegmentSummary {
  pitchDegrees: number;
  azimuthDegrees: number;
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  segmentIndex: number;
}

export interface SolarPanelConfig {
  panelsCount: number;
  yearlyEnergyDcKwh: number;
  roofSegmentSummaries: RoofSegmentSummary[];
}

export interface Money {
  currencyCode?: string;
  units?: number;
  nanos?: number;
}

export interface SavingsOverTime {
  savingsYear1?: Money;
  savingsYear20?: Money;
  presentValueOfSavingsYear20?: Money;
  savingsLifetime?: Money;
  presentValueOfSavingsLifetime?: Money;
  financiallyViable?: boolean;
}

export interface CashPurchaseSavings {
  outOfPocketCost?: Money;
  upfrontCost?: Money;
  rebateValue?: Money;
  savings?: SavingsOverTime;
  paybackYears?: number;
}

export interface FinancialAnalysis {
  monthlyBill?: Money;
  defaultBill?: boolean;
  averageKwhPerMonth?: number;
  cashPurchaseSavings?: CashPurchaseSavings;
  // Other financing options can be added here if needed
}

export interface SolarPotential {
  maxArrayPanelsCount: number;
  panelCapacityWatts: number;
  panelHeightMeters: number;
  panelWidthMeters: number;
  panelLifetimeYears: number;
  maxArrayAreaMeters2: number;
  maxSunshineHoursPerYear: number;
  carbonOffsetFactorKgPerMwh: number;
  wholeRoofStats: SizeAndSunshineStats;
  buildingStats: SizeAndSunshineStats;
  roofSegmentStats: RoofSegmentSizeAndSunshineStats[];
  solarPanels: SolarPanel[];
  solarPanelConfigs: SolarPanelConfig[];
  financialAnalyses: FinancialAnalysis[];
}

export interface BuildingInsightsResponse {
  name: string;
  center: LatLng;
  boundingBox: LatLngBox;
  imageryDate: Date;
  imageryProcessedDate: Date;
  postalCode: string;
  administrativeArea: string;
  statisticalArea: string;
  regionCode: string;
  solarPotential: SolarPotential;
  imageryQuality: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Custom type for combined data used in the app
export type AnalysisResult = {
  potential: BuildingInsightsResponse;
  visualization: DataLayersResponse;
};

// Helper types for GeoTIFF rendering
export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoTiff {
  width: number;
  height: number;
  rasters: Array<number>[];
  bounds: Bounds;
}
