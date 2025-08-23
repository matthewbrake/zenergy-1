
'use server';

import type { AnalysisResult, SolarPotentialAssessmentOutput, VisualizeSolarDataLayersOutput, BuildingInsights, FinancialAnalysis } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SOLAR_API_BASE_URL = 'https://solar.googleapis.com';

async function fetchSolarApi(endpoint: string, params: URLSearchParams): Promise<any> {
  if (!API_KEY) {
    const errorMsg = 'Google Maps API key is missing.';
    console.error(`[SERVER ACTION] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  
  params.append('key', API_KEY);
  const url = `${SOLAR_API_BASE_URL}/v1/${endpoint}?${params.toString()}`;

  console.log(`[SERVER ACTION] Fetching from Solar API URL: ${url}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[SERVER ACTION] Solar API request for endpoint "${endpoint}" failed with status ${response.status}: ${errorBody}`);
    
    let errorMessage = `Solar API request failed: ${response.statusText}.`;
    
    if (response.status === 404) {
      errorMessage = "We're sorry, but solar data is not available for this address. This may be because it's outside the coverage area or not recognized as a building.";
    } else {
        try {
          const errorJson = JSON.parse(errorBody);
           if (errorJson.error && errorJson.error.message) {
              errorMessage += ` Details: ${errorJson.error.message}`;
           } else {
             errorMessage += ` Details: ${errorBody}`;
           }
        } catch (e) {
          errorMessage += ` Details: ${errorBody}`;
        }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getSolarAnalysis(location: { lat: number; lng: number }): Promise<{ success: boolean; data?: AnalysisResult; error?: string; }> {
  console.log(`[SERVER ACTION] getSolarAnalysis called with location:`, location);
  
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    const errorMsg = 'Invalid location data received. Latitude and longitude must be numbers.';
    console.error(`[SERVER ACTION] ${errorMsg}`, location);
    return { success: false, error: errorMsg };
  }

  try {
    const buildingInsightsParams = new URLSearchParams({
      'location.latitude': location.lat.toString(),
      'location.longitude': location.lng.toString(),
      'requiredQuality': 'HIGH'
    });

    const dataLayersParams = new URLSearchParams({
      'location.latitude': location.lat.toString(),
      'location.longitude': location.lng.toString(),
      'radius_meters': '50',
      'view': 'FULL_LAYERS',
      'requiredQuality': 'HIGH',
      // Get a building mask layer as well
      'pixel_size_meters': '0.5',
    });

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
    
    const buildingInsights = (potentialResult as PromiseFulfilledResult<BuildingInsights>).value;
    const dataLayers = (visualizationResult as PromiseFulfilledResult<any>).value;

    if (!buildingInsights || !buildingInsights.solarPotential) {
        throw new Error('Building insights not found for this location. It may be outside the coverage area or no building was found within 50m of the point.');
    }

    console.log('[SERVER ACTION] Both API calls completed successfully.');
    
    // We get the full solar potential object and also find the default financial analysis to lift it to the top level
    const potential: SolarPotentialAssessmentOutput = {
      solarPotential: buildingInsights.solarPotential,
      maxArrayPanelsCount: buildingInsights.solarPotential.maxArrayPanelsCount,
      maxSunshineHoursPerYear: buildingInsights.solarPotential.maxSunshineHoursPerYear,
      carbonOffsetFactorKgPerMwh: buildingInsights.solarPotential.carbonOffsetFactorKgPerMwh,
      yearlyEnergyDcKwh: buildingInsights.solarPotential.yearlyEnergyDcKwh,
      financialAnalysis: buildingInsights.solarPotential.financialAnalyses?.find((a: FinancialAnalysis) => a.defaultBill === true),
      imageryDate: buildingInsights.imageryDate,
      imageryProcessedDate: buildingInsights.imageryProcessedDate,
      imageryQuality: buildingInsights.imageryQuality,
      panelLifetimeYears: buildingInsights.solarPotential.panelLifetimeYears,
    };
    
    const visualization: VisualizeSolarDataLayersOutput = {
      rgbImageryUrl: dataLayers.imageryUrl, // Corrected from rgbUrl
      digitalSurfaceModelUrl: dataLayers.dsmUrl,
      annualSolarFluxUrl: dataLayers.fluxUrl,
      monthlySolarFluxUrls: dataLayers.monthlyFlux ? [dataLayers.monthlyFlux] : [], // API returns one URL string
      hourlyShadeUrls: dataLayers.hourlyShadeUrls || [],
      buildingMaskUrl: dataLayers.maskUrl, // URL for the building mask
      boundingBox: buildingInsights.boundingBox ? {
        sw: { lat: buildingInsights.boundingBox.sw.latitude, lng: buildingInsights.boundingBox.sw.longitude },
        ne: { lat: buildingInsights.boundingBox.ne.latitude, lng: buildingInsights.boundingBox.ne.longitude },
      } : undefined,
    };

    return { success: true, data: { potential, visualization } as AnalysisResult };

  } catch (error: unknown) {
    const finalErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred during analysis.';
    console.error(`[SERVER ACTION] Final catch block error in getSolarAnalysis:`, finalErrorMessage);
    return { success: false, error: finalErrorMessage };
  }
}
