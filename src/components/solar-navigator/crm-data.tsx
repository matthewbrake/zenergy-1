'use client';

import { type AnalysisResult, type AddressData } from '@/lib/types';
import { appConfig } from '@/lib/config';

interface CrmDataProps {
  result: AnalysisResult;
  addressData: AddressData;
}

export default function CrmData({ result, addressData }: CrmDataProps) {
  // This object includes every piece of data from the solar API responses.
  const crmDataObject = {
    // Lead Identification
    "Lead.Status": "New",
    "Lead.Source": "Website Solar Funnel",
    "Lead.ServiceInterest": "Solar",
    
    // Property Details
    "Property.Address": addressData.address,
    "Property.GooglePlaceID": addressData.placeId,
    "Property.Latitude": addressData.location.lat,
    "Property.Longitude": addressData.location.lng,
    "Property.BoundingBox": result.potential.solarPotential?.boundingBox,
    
    // Solar Potential Assessment
    "Solar.PanelCapacityWatts": result.potential.solarPotential?.panelCapacityWatts,
    "Solar.PanelHeightMeters": result.potential.solarPotential?.panelHeightMeters,
    "Solar.PanelWidthMeters": result.potential.solarPotential?.panelWidthMeters,
    "Solar.PanelLifetimeYears": result.potential.solarPotential?.panelLifetimeYears,
    "Solar.MaxArrayPanelsCount": result.potential.maxArrayPanelsCount,
    "Solar.MaxArrayAreaMeters2": result.potential.solarPotential?.maxArrayAreaMeters2,
    "Solar.MaxSunshineHoursPerYear": result.potential.maxSunshineHoursPerYear,
    "Solar.CarbonOffsetFactorKgPerMwh": result.potential.carbonOffsetFactorKgPerMwh,
    
    // Energy Production
    "Solar.YearlyEnergyDcKwh": result.potential.yearlyEnergyDcKwh,
    "Solar.RoofSegmentSummaries": result.potential.solarPotential?.roofSegmentStats,
    "Solar.WholeRoofStats": result.potential.solarPotential?.wholeRoofStats,
    "Solar.SolarPanelConfigs": result.potential.solarPotential?.solarPanelConfigs,

    // Financial Analysis (Cash Purchase)
    "Financial.OutOfPocketCost": result.potential.financialAnalysis?.cashPurchaseSavings?.outOfPocketCost,
    "Financial.UpfrontCost": result.potential.financialAnalysis?.cashPurchaseSavings?.upfrontCost,
    "Financial.RebateValue": result.potential.financialAnalysis?.cashPurchaseSavings?.rebateValue,
    "Financial.PaybackYears": result.potential.financialAnalysis?.cashPurchaseSavings?.paybackYears,
    "Financial.SavingsYear1": result.potential.financialAnalysis?.cashPurchaseSavings?.savings?.savingsYear1,
    "Financial.SavingsYear20": result.potential.financialAnalysis?.cashPurchaseSavings?.savings?.savingsYear20,
    "Financial.SavingsLifetime": result.potential.financialAnalysis?.cashPurchaseSavings?.savings?.savingsLifetime,
    
    // API & Imagery Metadata
    "API.ImageryDate": result.potential.imageryDate,
    "API.ImageryProcessedDate": result.potential.imageryProcessedDate,
    "API.ImageryQuality": result.potential.imageryQuality,
    
    // Visualization Data (URLs)
    "Visualization.RgbImageryUrl": result.visualization.rgbImageryUrl,
    "Visualization.AnnualFluxUrl": result.visualization.annualSolarFluxUrl,
    "Visualization.MonthlyFluxUrls": result.visualization.monthlySolarFluxUrls,
    "Visualization.HourlyShadeUrls": result.visualization.hourlyShadeUrls,
    "Visualization.DsmUrl": result.visualization.digitalSurfaceModelUrl,
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {appConfig.solarReport.details.crm.description}
      </p>
      <div className="p-4 rounded-md bg-muted/50 max-h-96 overflow-auto">
        <pre className="text-sm text-foreground whitespace-pre-wrap">
          {JSON.stringify(crmDataObject, null, 2)}
        </pre>
      </div>
    </div>
  );
}
