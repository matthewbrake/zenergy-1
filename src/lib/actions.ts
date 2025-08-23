
'use server';

import type { BuildingInsightsResponse, DataLayersResponse, AnalysisResult } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SOLAR_API_BASE_URL = 'https://solar.googleapis.com';

// Generic fetch function for the Solar API
async function fetchSolarApi(endpoint: string, params: URLSearchParams): Promise<any> {
  if (!API_KEY) {
    const errorMsg = 'Google Maps API key is missing. This is a configuration issue. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.';
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
    let errorJson;
    try {
        errorJson = JSON.parse(errorBody);
    } catch (e) {
        // Not a JSON response
    }

    const defaultErrorMessage = `Solar API request for endpoint "${endpoint}" failed with status ${response.status}.`;
    
    if (errorJson && errorJson.error) {
      if (errorJson.error.message.includes('not found in our database')) {
        throw new Error("We're sorry, but solar data is not available for this address. This may be because it's outside the coverage area or not recognized as a building.");
      }
      throw new Error(`${defaultErrorMessage} Details: ${errorJson.error.message}`);
    }

    throw new Error(`${defaultErrorMessage} Raw Response: ${errorBody}`);
  }

  return response.json();
}

/**
 * Fetches Building Insights from the Solar API.
 * @param location The latitude and longitude.
 * @returns A promise that resolves with the building insights.
 */
async function findClosestBuilding(location: { lat: number; lng: number }): Promise<BuildingInsightsResponse> {
  const params = new URLSearchParams({
    'location.latitude': location.lat.toString(),
    'location.longitude': location.lng.toString(),
    'required_quality': 'HIGH',
  });
  return fetchSolarApi('buildingInsights:findClosest', params);
}

/**
 * Fetches Data Layers from the Solar API.
 * @param location The latitude and longitude.
 * @param radiusMeters The radius to fetch data for.
 * @returns A promise that resolves with the data layers.
 */
async function getDataLayers(location: { lat: number; lng: number }, radiusMeters: number = 50): Promise<DataLayersResponse> {
  const params = new URLSearchParams({
    'location.latitude': location.lat.toString(),
    'location.longitude': location.lng.toString(),
    'radius_meters': radiusMeters.toString(),
    'view': 'FULL_LAYERS',
    'required_quality': 'HIGH',
    'pixel_size_meters': '0.5',
  });
  return fetchSolarApi('dataLayers:get', params);
}

/**
 * Main server action to get the complete solar analysis for a given location.
 * It fetches building insights and data layers in parallel.
 * @param location The latitude and longitude.
 * @returns An object indicating success or failure, with data or an error message.
 */
export async function getSolarAnalysis(location: { lat: number; lng: number }): Promise<{ success: boolean; data?: AnalysisResult; error?: string; }> {
  console.log(`[SERVER ACTION] getSolarAnalysis called with location:`, location);
  
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    const errorMsg = 'Invalid location data received. Latitude and longitude must be numbers.';
    console.error(`[SERVER ACTION] ${errorMsg}`, location);
    return { success: false, error: errorMsg };
  }

  try {
    console.log('[SERVER ACTION] Running Solar API calls in parallel...');
    
    // Use Promise.allSettled to ensure both requests complete, even if one fails.
    const [potentialResult, visualizationResult] = await Promise.allSettled([
        findClosestBuilding(location),
        getDataLayers(location),
    ]);

    // Aggregate errors from rejected promises
    const errors: any[] = [];
    if (potentialResult.status === 'rejected') {
        errors.push({ api: 'Building Insights', reason: potentialResult.reason?.message || 'Unknown error' });
    }
    if (visualizationResult.status === 'rejected') {
        errors.push({ api: 'Data Layers', reason: visualizationResult.reason?.message || 'Unknown error' });
    }
    
    if (errors.length > 0) {
      const errorMessage = `One or more critical Solar API calls failed. Details: ${errors.map(e => `${e.api}: ${e.reason}`).join('; ')}`;
      throw new Error(errorMessage);
    }
    
    const buildingInsights = (potentialResult as PromiseFulfilledResult<BuildingInsightsResponse>).value;
    const dataLayers = (visualizationResult as PromiseFulfilledResult<DataLayersResponse>).value;

    if (!buildingInsights?.solarPotential) {
        throw new Error('Building insights not found. The address may be outside the coverage area or not recognized as a building.');
    }
    if (!dataLayers?.rgbUrl) {
        throw new Error('Data layers (imagery) could not be retrieved for this location.');
    }

    console.log('[SERVER ACTION] Both API calls completed successfully.');
    
    const result: AnalysisResult = {
        potential: buildingInsights,
        visualization: dataLayers,
    };

    return { success: true, data: result };

  } catch (error: unknown) {
    const finalErrorMessage = error instanceof Error ? error.message : 'An unknown error occurred during the server-side analysis.';
    console.error(`[SERVER ACTION] Final catch block in getSolarAnalysis:`, finalErrorMessage);
    return { success: false, error: finalErrorMessage };
  }
}
