'use server';

/**
 * @fileOverview Performs an initial solar potential assessment using the Google buildingInsights API.
 *
 * - solarPotentialAssessment - A function that initiates the solar potential assessment process.
 * - SolarPotentialAssessmentInput - The input type for the solarPotentialAssessment function.
 * - SolarPotentialAssessmentOutput - The return type for the solarPotentialAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolarPotentialAssessmentInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type SolarPotentialAssessmentInput = z.infer<typeof SolarPotentialAssessmentInputSchema>;

const SolarPotentialAssessmentOutputSchema = z.object({
  maxArrayPanelsCount: z
    .number()
    .optional()
    .describe('The maximum number of panels that can fit on the roof.'),
  maxSunshineHoursPerYear: z
    .number()
    .optional()
    .describe('The maximum sunshine hours per year for the location.'),
  yearlyEnergyDcKwh: z
    .number()
    .optional()
    .describe('Yearly energy generation in DC kWh'),
  financialAnalysis: z
    .any()
    .optional()
    .describe('Financial analysis data, including cost estimates and savings projections.'),
  sunshineQuantiles: z
    .array(z.number())
    .optional()
    .describe('Decile breakdown of sunniness of the roof.'),
});
export type SolarPotentialAssessmentOutput = z.infer<typeof SolarPotentialAssessmentOutputSchema>;

export async function solarPotentialAssessment(input: SolarPotentialAssessmentInput): Promise<SolarPotentialAssessmentOutput> {
  return solarPotentialAssessmentFlow(input);
}

const solarPotentialAssessmentFlow = ai.defineFlow(
  {
    name: 'solarPotentialAssessmentFlow',
    inputSchema: SolarPotentialAssessmentInputSchema,
    outputSchema: SolarPotentialAssessmentOutputSchema,
  },
  async input => {
    console.log('[FLOW:solarPotentialAssessment] Starting flow with input:', input);
    try {
      const {latitude, longitude} = input;
      const result = await ai.generate({
        model: 'googleai/building-insights',
        prompt: `Assess the solar potential for the building at latitude ${latitude} and longitude ${longitude}.`,
        config: {
          buildingInsights: {
            building: {
              latitude: latitude,
              longitude: longitude,
            }
          },
        },
      });

      console.log('[FLOW:solarPotentialAssessment] Raw API response received.');
      const content = result.output?.buildingInsights?.solarPotential;

      if (!content) {
        console.error('[FLOW:solarPotentialAssessment] No solar potential content in API response.', JSON.stringify(result.output, null, 2));
        throw new Error('API response did not contain the expected solarPotential content.');
      }

      console.log('[FLOW:solarPotentialAssessment] Flow completed successfully.');
      return {
        maxArrayPanelsCount: content.maxArrayPanelsCount,
        maxSunshineHoursPerYear: content.maxSunshineHoursPerYear,
        yearlyEnergyDcKwh: content.solarPanelConfigs?.[0]?.yearlyEnergyDcKwh,
        financialAnalysis: content.financialAnalyses?.['cashPurchaseSavings'],
        sunshineQuantiles: content.solarPotential?.sunshineQuantiles,
      };

    } catch (e: any) {
      console.error('!!!!!!!!!!!! ERROR IN solarPotentialAssessmentFlow !!!!!!!!!!!!');
      console.error('Error message:', e.message);
      console.error('Full error object:', JSON.stringify(e, null, 2));
      console.error('Stack trace:', e.stack);
      throw new Error(`Failed during solar potential assessment flow: ${e.message}`);
    }
  }
);
