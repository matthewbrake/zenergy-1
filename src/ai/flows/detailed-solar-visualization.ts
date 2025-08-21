'use server';

/**
 * @fileOverview Fetches and processes solar data layers to visualize solar potential on a map.
 *
 * - visualizeSolarDataLayers - A function that handles the visualization of solar data layers.
 * - VisualizeSolarDataLayersInput - The input type for the visualizeSolarDataLayers function.
 * - VisualizeSolarDataLayersOutput - The return type for the visualizeSolarDataLayers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeSolarDataLayersInputSchema = z.object({
  latitude: z
    .number()
    .describe('The latitude of the location to visualize solar data for.'),
  longitude: z
    .number()
    .describe('The longitude of the location to visualize solar data for.'),
});
export type VisualizeSolarDataLayersInput = z.infer<
  typeof VisualizeSolarDataLayersInputSchema
>;

const VisualizeSolarDataLayersOutputSchema = z.object({
  rgbImageryUrl: z.string().describe('URL to the RGB aerial imagery GeoTIFF.'),
  digitalSurfaceModelUrl: z
    .string()
    .describe('URL to the Digital Surface Model GeoTIFF.'),
  annualSolarFluxUrl: z
    .string()
    .describe('URL to the annual solar flux GeoTIFF.'),
  monthlySolarFluxUrls: z
    .array(z.string())
    .describe('URLs to the monthly solar flux GeoTIFFs.'),
  hourlyShadeUrls: z.array(z.string()).describe('URLs to the hourly shade GeoTIFFs'),
  buildingMaskUrl: z.string().describe('URL to the building mask GeoTIFF.'),
});
export type VisualizeSolarDataLayersOutput = z.infer<
  typeof VisualizeSolarDataLayersOutputSchema
>;

export async function visualizeSolarDataLayers(
  input: VisualizeSolarDataLayersInput
): Promise<VisualizeSolarDataLayersOutput> {
  return visualizeSolarDataLayersFlow(input);
}

const visualizeSolarDataLayersFlow = ai.defineFlow(
  {
    name: 'visualizeSolarDataLayersFlow',
    inputSchema: VisualizeSolarDataLayersInputSchema,
    outputSchema: VisualizeSolarDataLayersOutputSchema,
  },
  async input => {
    const {latitude, longitude} = input;

    const dataLayersResult = await ai.generate({
      model: 'googleai/building-insights',
      prompt: `Fetch the dataLayers GeoTIFF URLs for the location at latitude ${latitude} and longitude ${longitude}.`, // Removed Handlebars templating as it's not needed here
      config: {
        buildingInsights: {
          dataLayers: {
            latitude: latitude,
            longitude: longitude,
          },
        },
      },
    });

    // Extract the URLs from the response
    const content = dataLayersResult.output?.buildingInsights?.dataLayers?.layers;

    const rgbImageryUrl = content?.find(layer => layer.type === 'RGB_IMAGERY')?.source?.uri || '';
    const digitalSurfaceModelUrl = content?.find(layer => layer.type === 'DIGITAL_SURFACE_MODEL')?.source?.uri || '';
    const annualSolarFluxUrl = content?.find(layer => layer.type === 'ANNUAL_SOLAR_FLUX')?.source?.uri || '';

    const monthlySolarFluxUrls = content
      ?.filter(layer => layer.type === 'MONTHLY_SOLAR_FLUX')
      .map(layer => layer.source?.uri);

    const hourlyShadeUrls = content
      ?.filter(layer => layer.type === 'HOURLY_SHADE')
      .map(layer => layer.source?.uri);

    const buildingMaskUrl = content?.find(layer => layer.type === 'BUILDING_MASK')?.source?.uri || '';

    return {
      rgbImageryUrl,
      digitalSurfaceModelUrl,
      annualSolarFluxUrl,
      monthlySolarFluxUrls: monthlySolarFluxUrls || [],
      hourlyShadeUrls: hourlyShadeUrls || [],
      buildingMaskUrl,
    };
  }
);
