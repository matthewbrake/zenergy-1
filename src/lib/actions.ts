'use server';

import type { AnalysisResult, SolarPotentialAssessmentOutput, VisualizeSolarDataLayersOutput } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SOLAR_API_BASE_URL = 'https://solar.googleapis.com';

async function fetchSolarApi(endpoint: string, params: Record<string, any>): Promise<any> {
  if (!API_KEY) {
    throw new Error('Google Maps API key is missing.');
  }
  
  const url = new URL(`${SOLAR_API_BASE_URL}/v1/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key].toString()));
  url.searchParams.append('key', API_KEY);

  console.log(`[SERVER ACTION] Fetching from Solar API: ${url.toString()}`);
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[SERVER ACTION] Solar API request failed with status ${response.status}: ${errorBody}`);
    let errorMessage = `Solar API request failed: ${response.statusText}.`;
    try {
      const errorJson = JSON.parse(errorBody);
       if (errorJson.error && errorJson.error.message) {
         if (errorJson.error.status === 'NOT_FOUND') {
            errorMessage = "We're sorry, but solar data is not available for this address. This may be because it's outside the coverage area or not recognized as a building.";
         } else {
            errorMessage += ` Details: ${errorJson.error.message}`;
         }
       } else {
         errorMessage += ` Details: ${errorBody}`;
       }
    } catch (e) {
      errorMessage += ` Details: ${errorBody}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getSolarAnalysis(location: { lat: number; lng: number }): Promise<{ success: boolean; data?: AnalysisResult; error?: string; }> {
  console.log(`[SERVER ACTION] getSolarAnalysis called with location:`, location);
  
  try {
    const buildingInsightsParams = {
      'location.latitude': location.lat,
      'location.longitude': location.lng,
      'requiredQuality': 'HIGH'
    };

    const dataLayersParams = {
      'location.latitude': location.lat,
      'location.longitude': location.lng,
      'radius_meters': 50,
      'view': 'FULL_LAYERS',
      'requiredQuality': 'HIGH',
    };

    console.log('[SERVER ACTION] Running Solar API calls in parallel...');
    
    const [potentialResult, visualizationResult] = await Promise.allSettled([
        fetchSolarApi('buildingInsights:findClosest', buildingInsightsParams),
        fetchSolarApi('dataLayers:get', dataLayersParams),
    ]);

    const errors: any[] = [];
    if (potentialResult.status === 'rejected') {
        errors.push({ api: 'buildingInsights', reason: potentialResult.reason?.message || 'Unknown error' });
    }
    if (visualizationResult.status === 'rejected') {
        errors.push({ api: 'dataLayers', reason: visualizationResult.reason?.message || 'Unknown error' });
    }
    
    if (errors.length > 0) {
      const errorMessage = `One or more Solar API calls failed. Details: ${errors.map(e => `${e.api}: ${e.reason}`).join('; ')}`;
      console.error(`[SERVER ACTION] Detailed error summary:`, JSON.stringify(errors, null, 2));
      throw new Error(errorMessage);
    }
    
    const buildingInsights = (potentialResult as PromiseFulfilledResult<any>).value;
    const dataLayers = (visualizationResult as PromiseFulfilledResult<any>).value;

    if (!buildingInsights || !buildingInsights.solarPotential) {
        throw new Error('Building insights not found for this location. It may be outside the coverage area or no building was found within 50m of the point.');
    }

    console.log('[SERVER ACTION] Both API calls completed successfully.');
    
    const potential: SolarPotentialAssessmentOutput = {
      ...buildingInsights.solarPotential,
      financialAnalysis: buildingInsights.solarPotential.financialAnalyses?.find((a: any) => a.defaultBill === true),
    };
    
    const visualization: VisualizeSolarDataLayersOutput = {
      rgbImageryUrl: dataLayers.imageryQuality === 'HIGH' ? dataLayers.rgbUrl : '',
      digitalSurfaceModelUrl: dataLayers.dsmUrl,
      annualSolarFluxUrl: dataLayers.fluxUrl,
      monthlySolarFluxUrls: dataLayers.monthlyFluxUrl ? [dataLayers.monthlyFluxUrl] : [],
      hourlyShadeUrls: dataLayers.hourlyShadeUrls || [],
      buildingMaskUrl: '', 
      boundingBox: buildingInsights.boundingBox,
    };

    return { success: true, data: { potential, visualization } };

  } catch (error: unknown) {
    const finalErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    console.error(`[SERVER ACTION] Final catch block error in getSolarAnalysis:`, finalErrorMessage);
    console.error(`[SERVER ACTION] Full error object:`, error);
    return { success: false, error: finalErrorMessage };
  }
}
