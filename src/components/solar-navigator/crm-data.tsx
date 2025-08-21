'use client';

import { type AnalysisResult, type AddressData } from '@/lib/types';

interface CrmDataProps {
  result: AnalysisResult;
  addressData: AddressData;
}

export default function CrmData({ result, addressData }: CrmDataProps) {
  const crmDataObject = {
    "Property.GooglePlaceID": addressData.placeId,
    "Property.Latitude": addressData.location.lat,
    "Property.Longitude": addressData.location.lng,
    // location_type requires a Geocoding API call, which is abstracted.
    // We'll add a placeholder to represent this valuable data point.
    "Property.AddressConfidence": "ROOFTOP (example)",
    "Solar.MaxPanels": result.potential.maxArrayPanelsCount,
    "Solar.AnnualSunHours": result.potential.maxSunshineHoursPerYear,
    "Solar.FinancialData": result.potential.financialAnalysis,
    "Solar.GeoTIFF_URLs": result.visualization,
    "Solar.CarbonOffsetFactorKgPerMwh": 250 // Example value
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        The following data object represents the enriched information that would be stored in your CRM. This provides your sales team with actionable intelligence for lead prioritization and follow-up.
      </p>
      <div className="p-4 rounded-md bg-muted/50 max-h-96 overflow-auto">
        <pre className="text-sm text-foreground whitespace-pre-wrap">
          {JSON.stringify(crmDataObject, null, 2)}
        </pre>
      </div>
    </div>
  );
}
