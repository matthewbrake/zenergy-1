'use server';

import type { AnalysisResult, SolarPotentialAssessmentOutput, VisualizeSolarDataLayersOutput } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SOLAR_API_URL = 'https://solar.googleapis.com/v1';

async function fetchSolarApi(endpoint: string, params: Record<string, any>): Promise<any> {
  if (!API_KEY) {
    throw new Error('Google Maps API key is missing.');
  }
  
  const url = new URL(`${SOLAR_API_URL}/${endpoint}`);
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
    try {
      // Try to parse the error body as JSON for more detailed logging
      const errorJson = JSON.parse(errorBody);
      throw new Error(`Solar API request failed: ${response.statusText}. Details: ${JSON.stringify(errorJson)}`);
    } catch (e) {
      // If parsing fails, just throw the raw text
      throw new Error(`Solar API request failed: ${response.statusText}. Details: ${errorBody}`);
    }
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
    
    // Adapt the API responses to our existing types
    const potential: SolarPotentialAssessmentOutput = {
      maxArrayPanelsCount: buildingInsights.solarPotential.maxArrayPanelsCount,
      maxSunshineHoursPerYear: buildingInsights.solarPotential.maxSunshineHoursPerYear,
      yearlyEnergyDcKwh: buildingInsights.solarPotential.solarPanelConfigs?.[0]?.yearlyEnergyDcKwh,
      financialAnalysis: buildingInsights.solarPotential.financialAnalyses?.find((a: any) => a.cashPurchaseSavings),
      sunshineQuantiles: buildingInsights.solarPotential.wholeRoofStats?.sunshineQuantiles,
    };
    
    const visualization: VisualizeSolarDataLayersOutput = {
      rgbImageryUrl: dataLayers.imageryQuality === 'HIGH' ? dataLayers.rgbUrl : '',
      digitalSurfaceModelUrl: dataLayers.dsmUrl,
      annualSolarFluxUrl: dataLayers.fluxUrl,
      monthlySolarFluxUrls: dataLayers.monthlyFluxUrl ? [dataLayers.monthlyFluxUrl] : [],
      hourlyShadeUrls: dataLayers.hourlyShadeUrls || [],
      buildingMaskUrl: '', // Not directly available in this response
    };

    return { success: true, data: { potential, visualization } };

  } catch (error: unknown) {
    const finalErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    console.error(`[SERVER ACTION] Final catch block error in getSolarAnalysis:`, finalErrorMessage);
    console.error(`[SERVER ACTION] Full error object:`, error);
    return { success: false, error: finalErrorMessage };
  }
}
