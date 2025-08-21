'use server';

import { solarPotentialAssessment, SolarPotentialAssessmentInput } from '@/ai/flows/solar-potential-assessment';
import { visualizeSolarDataLayers, VisualizeSolarDataLayersInput } from '@/ai/flows/detailed-solar-visualization';
import type { AnalysisResult } from '@/lib/types';

export async function getSolarAnalysis(location: { lat: number; lng: number }): Promise<{ success: boolean; data?: AnalysisResult; error?: string; }> {
  console.log(`[SERVER ACTION] getSolarAnalysis called with location:`, location);
  try {
    const potentialInput: SolarPotentialAssessmentInput = {
      latitude: location.lat,
      longitude: location.lng,
    };
    const visualizationInput: VisualizeSolarDataLayersInput = {
      latitude: location.lat,
      longitude: location.lng,
    };

    console.log('[SERVER ACTION] Running solar assessment and visualization flows in parallel...');
    const [potentialResult, visualizationResult] = await Promise.allSettled([
      solarPotentialAssessment(potentialInput),
      visualizeSolarDataLayers(visualizationInput),
    ]);

    let hadError = false;
    let errorMessage = 'Solar data not available for this location. The building might be out of the coverage area.';
    const errors: any[] = [];

    if (potentialResult.status === 'rejected') {
      hadError = true;
      console.error('!!!!!!!!!!!! SOLAR POTENTIAL ASSESSMENT FAILED !!!!!!!!!!!!');
      console.error('REASON:', potentialResult.reason);
      errors.push({ flow: 'solarPotentialAssessment', reason: potentialResult.reason });
    }

    if (visualizationResult.status === 'rejected') {
      hadError = true;
      console.error('!!!!!!!!!!!! SOLAR DATA LAYERS VISUALIZATION FAILED !!!!!!!!!!!!');
      console.error('REASON:', visualizationResult.reason);
      errors.push({ flow: 'visualizeSolarDataLayers', reason: visualizationResult.reason });
    }

    if (hadError) {
       // Create a more detailed error message
       errorMessage = `One or more Solar API calls failed. Details: ${errors.map(e => `${e.flow}: ${e.reason?.message || 'Unknown error'}`).join('; ')}`;
       console.error(`[SERVER ACTION] Detailed error summary:`, JSON.stringify(errors, null, 2));
       throw new Error(errorMessage);
    }
    
    console.log('[SERVER ACTION] Both flows completed successfully.');
    const data: AnalysisResult = {
      potential: potentialResult.value,
      visualization: (visualizationResult as PromiseFulfillment<VisualizeSolarDataLayersOutput>).value,
    };
    
    return { success: true, data };

  } catch (error: unknown) {
    const finalErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    console.error(`[SERVER ACTION] Final catch block error in getSolarAnalysis:`, finalErrorMessage);
    console.error(`[SERVER ACTION] Full error object:`, error);
    return { success: false, error: finalErrorMessage };
  }
}

// Helper type to satisfy TypeScript when accessing .value
type PromiseFulfillment<T> = {
  status: 'fulfilled';
  value: T;
};
