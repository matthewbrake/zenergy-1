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

const solarPotentialAssessmentPrompt = ai.definePrompt({
  name: 'solarPotentialAssessmentPrompt',
  input: {schema: SolarPotentialAssessmentInputSchema},
  output: {schema: SolarPotentialAssessmentOutputSchema},
  prompt: `You are an expert solar energy consultant. Given the latitude and longitude of a building, you will use the buildingInsights API to assess its solar potential.

  Latitude: {{{latitude}}}
  Longitude: {{{longitude}}}

  Return the maximum number of panels that can fit on the roof (maxArrayPanelsCount), the maximum sunshine hours per year (maxSunshineHoursPerYear), the financial analysis data (financialAnalysis), and the sunshine quantiles (sunshineQuantiles).
  Also include the yearlyEnergyDcKwh if available in the response.`,
});

const solarPotentialAssessmentFlow = ai.defineFlow(
  {
    name: 'solarPotentialAssessmentFlow',
    inputSchema: SolarPotentialAssessmentInputSchema,
    outputSchema: SolarPotentialAssessmentOutputSchema,
  },
  async input => {
    try {
      const {output} = await solarPotentialAssessmentPrompt(input);
      return output!;
    } catch (e: any) {
      console.error('Error during solar potential assessment:', e);
      throw new Error(`Failed to assess solar potential: ${e.message}`);
    }
  }
);
