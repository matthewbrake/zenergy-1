'use client';

import { useRouter } from 'next/navigation';
import { type AnalysisResult, type AddressData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import MetricCard from './metric-card';
import MapView from './map-view';
import CrmData from './crm-data';
import FinancialSummary from './financial-summary';
import { Sun, Zap, Target, RefreshCw, Leaf, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { appConfig } from '@/lib/config';


interface AnalysisDisplayProps {
  result: AnalysisResult;
  addressData: AddressData;
  onReset: () => void;
}

export default function AnalysisDisplay({ result, addressData, onReset }: AnalysisDisplayProps) {
  const router = useRouter();
  const { potential } = result;
  
  const viabilityScore = potential.sunshineQuantiles && potential.sunshineQuantiles.length > 0
    ? Math.round(potential.sunshineQuantiles[Math.floor(potential.sunshineQuantiles.length * 0.8)] / (potential.maxSunshineHoursPerYear || 2000) * 100)
    : 75; // Default score

  const twentyYearSavings = potential.financialAnalysis?.cashPurchaseSavings?.savings?.savingsYear20?.units || 0;
  const carbonOffset = potential.carbonOffsetFactorKgPerMwh || 0;

  return (
    <div className="w-full space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-primary">{appConfig.solarReport.reportTitle}</h2>
        <p className="text-muted-foreground mt-1">{addressData.address}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card className="h-full shadow-lg">
             <CardContent className="p-2 h-[500px]">
              <MapView location={addressData.location} visualizationData={result.visualization} />
             </CardContent>
           </Card>
        </div>
        <div className="space-y-4">
          <MetricCard 
            icon={Target}
            label="Solar Viability Score"
            value={`${viabilityScore}/100`}
            description="Overall suitability for solar, based on sun exposure."
          />
          <MetricCard
            icon={Zap}
            label="Max Panel Count"
            value={potential.maxArrayPanelsCount || 'N/A'}
            description="The estimated maximum number of solar panels that can fit on your roof."
          />
          <MetricCard
            icon={Sun}
            label="20-Year Savings"
            value={`${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(twentyYearSavings)}`}
            description="Estimated savings over two decades with a cash purchase."
          />
           <MetricCard
            icon={Leaf}
            label="Carbon Offset"
            value={`${carbonOffset.toFixed(0)} kg/MWh`}
            description="CO₂ offset by generating your own clean energy."
          />
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Financial & Technical Details</CardTitle>
          <CardDescription>Explore the potential savings, system output, and data we've collected.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="financials">
            <AccordionItem value="financials">
              <AccordionTrigger className="text-lg font-semibold">Financial Summary</AccordionTrigger>
              <AccordionContent>
                {potential.financialAnalysis ? (
                   <FinancialSummary financialAnalysis={potential.financialAnalysis} solarPotential={potential} />
                ) : (
                  <p className="text-muted-foreground">Financial analysis data is not available for this location.</p>
                )}
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="crm-data">
              <AccordionTrigger className="text-lg font-semibold">CRM Integration Data</AccordionTrigger>
              <AccordionContent>
                <CrmData result={result} addressData={addressData} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <div className="text-center pt-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:gap-4">
        <Button onClick={onReset} size="lg" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Start New Analysis
        </Button>
        <Button onClick={() => router.push('/financial-details')} size="lg">
          Continue to Financial Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
