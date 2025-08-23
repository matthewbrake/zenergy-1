'use client';

import { type AnalysisResult, type AddressData } from '@/lib/types';
import { appConfig } from '@/lib/config';

interface CrmDataProps {
  result: AnalysisResult;
  addressData: AddressData;
}

export default function CrmData({ result, addressData }: CrmDataProps) {
    const { potential, visualization } = result;

  const defaultFinancials = potential.solarPotential.financialAnalyses.find(
      (analysis) => analysis.monthlyBill?.units === 150
  ) || potential.solarPotential.financialAnalyses[0];

  const crmDataObject = {
    "Lead.Status": "New",
    "Lead.Source": "Website Solar Funnel",
    "Lead.ServiceInterest": "Solar",
    
    "Property.Address": addressData.address,
    "Property.GooglePlaceID": addressData.placeId,
    "Property.Latitude": addressData.location.lat,
    "Property.Longitude": addressData.location.lng,
    "Property.BoundingBox": potential.boundingBox,
    
    "Solar.PanelCapacityWatts": potential.solarPotential.panelCapacityWatts,
    "Solar.PanelHeightMeters": potential.solarPotential.panelHeightMeters,
    "Solar.PanelWidthMeters": potential.solarPotential.panelWidthMeters,
    "Solar.PanelLifetimeYears": potential.solarPotential.panelLifetimeYears,
    "Solar.MaxArrayPanelsCount": potential.solarPotential.maxArrayPanelsCount,
    "Solar.MaxArrayAreaMeters2": potential.solarPotential.maxArrayAreaMeters2,
    "Solar.MaxSunshineHoursPerYear": potential.solarPotential.maxSunshineHoursPerYear,
    "Solar.CarbonOffsetFactorKgPerMwh": potential.solarPotential.carbonOffsetFactorKgPerMwh,
    
    "Solar.YearlyEnergyDcKwh": potential.solarPotential.solarPanelConfigs.find(c => c.panelsCount === potential.solarPotential.maxArrayPanelsCount)?.yearlyEnergyDcKwh,
    "Solar.RoofSegmentSummaries": potential.solarPotential.roofSegmentStats,
    "Solar.WholeRoofStats": potential.solarPotential.wholeRoofStats,
    "Solar.SolarPanelConfigs": potential.solarPotential.solarPanelConfigs,

    "Financial.OutOfPocketCost": defaultFinancials?.cashPurchaseSavings?.outOfPocketCost,
    "Financial.UpfrontCost": defaultFinancials?.cashPurchaseSavings?.upfrontCost,
    "Financial.RebateValue": defaultFinancials?.cashPurchaseSavings?.rebateValue,
    "Financial.PaybackYears": defaultFinancials?.cashPurchaseSavings?.paybackYears,
    "Financial.SavingsYear1": defaultFinancials?.cashPurchaseSavings?.savings?.savingsYear1,
    "Financial.SavingsYear20": defaultFinancials?.cashPurchaseSavings?.savings?.savingsYear20,
    "Financial.SavingsLifetime": defaultFinancials?.cashPurchaseSavings?.savings?.savingsLifetime,
    
    "API.ImageryDate": potential.imageryDate,
    "API.ImageryProcessedDate": potential.imageryProcessedDate,
    "API.ImageryQuality": potential.imageryQuality,
    
    "Visualization.RgbImageryUrl": visualization.rgbUrl,
    "Visualization.AnnualFluxUrl": visualization.annualFluxUrl,
    "Visualization.MonthlyFluxUrl": visualization.monthlyFluxUrl,
    "Visualization.HourlyShadeUrls": visualization.hourlyShadeUrls,
    "Visualization.DsmUrl": visualization.dsmUrl,
    "Visualization.MaskUrl": visualization.maskUrl,
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
