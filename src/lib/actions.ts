'use server';

import { solarPotentialAssessment, SolarPotentialAssessmentInput } from '@/ai/flows/solar-potential-assessment';
import { visualizeSolarDataLayers, VisualizeSolarDataLayersInput } from '@/ai/flows/detailed-solar-visualization';
import type { AnalysisResult } from '@/lib/types';

export async function getSolarAnalysis(location: { lat: number; lng: number }): Promise<{ success: boolean; data?: AnalysisResult; error?: string; }> {
  try {
    const potentialInput: SolarPotentialAssessmentInput = {
      latitude: location.lat,
      longitude: location.lng,
    };
    const visualizationInput: VisualizeSolarDataLayersInput = {
      latitude: location.lat,
      longitude: location.lng,
    };

    // The API can sometimes fail for locations without coverage.
    // We run them in parallel for efficiency.
    const [potentialResult, visualizationResult] = await Promise.allSettled([
      solarPotentialAssessment(potentialInput),
      visualizeSolarDataLayers(visualizationInput),
    ]);

    if (potentialResult.status === 'rejected' || visualizationResult.status === 'rejected') {
        // Check which one failed to give a more specific error
        if (potentialResult.status === 'rejected') {
            console.error('Solar potential assessment failed:', potentialResult.reason);
        }
        if (visualizationResult.status === 'rejected') {
            console.error('Solar data layers visualization failed:', visualizationResult.reason);
        }
        throw new Error('Solar data not available for this location. The building might be out of the coverage area.');
    }

    const data: AnalysisResult = {
      potential: potentialResult.value,
      visualization: visualizationResult.value,
    };
    
    return { success: true, data };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('getSolarAnalysis Error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
