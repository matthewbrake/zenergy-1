import { z } from 'zod';
import type { SolarPotentialAssessmentOutput } from '@/ai/flows/solar-potential-assessment';
import type { VisualizeSolarDataLayersOutput } from '@/ai/flows/detailed-solar-visualization';

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

export type AnalysisResult = {
  potential: SolarPotentialAssessmentOutput;
  visualization: VisualizeSolarDataLayersOutput;
};
