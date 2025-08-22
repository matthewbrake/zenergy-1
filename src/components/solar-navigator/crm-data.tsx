'use client';

import { type AnalysisResult, type AddressData } from '@/lib/types';

interface CrmDataProps {
  result: AnalysisResult;
  addressData: AddressData;
}

export default function CrmData({ result, addressData }: CrmDataProps) {
  const crmDataObject = {
    "Lead.Status": "New",
    "Lead.Source": "Website Solar Funnel",
    "Property.Address": addressData.address,
    "Property.GooglePlaceID": addressData.placeId,
    "Property.Latitude": addressData.location.lat,
    "Property.Longitude": addressData.location.lng,
    "Solar.MaxPanels": result.potential.maxArrayPanelsCount,
    "Solar.MaxSunshineHoursPerYear": result.potential.maxSunshineHoursPerYear,
    "Solar.CarbonOffsetFactorKgPerMwh": result.potential.carbonOffsetFactorKgPerMwh,
    "Solar.YearlyEnergyDcKwh": result.potential.yearlyEnergyDcKwh,
    "Solar.FinancialAnalysis": result.potential.financialAnalysis,
    "Solar.VisualizationURLs": result.visualization,
    "API.ImageryDate": result.potential.imageryDate,
    "API.ImageryProcessedDate": result.potential.imageryProcessedDate,
    "API.ImageryQuality": result.potential.imageryQuality,
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
