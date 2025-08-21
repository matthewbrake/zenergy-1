'use client';

import { type AnalysisResult, type AddressData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import MetricCard from './metric-card';
import MapView from './map-view';
import CrmData from './crm-data';
import FinancialSummary from './financial-summary';
import { Sun, Zap, Target, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


interface AnalysisDisplayProps {
  result: AnalysisResult;
  addressData: AddressData;
  onReset: () => void;
}

export default function AnalysisDisplay({ result, addressData, onReset }: AnalysisDisplayProps) {
  const { potential } = result;
  
  const viabilityScore = potential.sunshineQuantiles && potential.sunshineQuantiles.length > 0
    ? Math.round(potential.sunshineQuantiles[Math.floor(potential.sunshineQuantiles.length * 0.8)] / 100)
    : 75; // Default score

  return (
    <div className="w-full space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-primary">Solar Analysis Complete</h2>
        <p className="text-muted-foreground mt-1">{addressData.address}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card className="h-full shadow-lg">
             <CardContent className="p-2 h-[500px]">
              <MapView location={addressData.location} />
             </CardContent>
           </Card>
        </div>
        <div className="space-y-6">
          <MetricCard 
            icon={Target}
            label="Solar Viability Score"
            value={`${viabilityScore}/100`}
            description="Overall suitability for solar, based on sun exposure."
          />
          <MetricCard
            icon={Sun}
            label="Max Sunshine Hours"
            value={`${potential.maxSunshineHoursPerYear?.toFixed(0) || 'N/A'} hrs/yr`}
            description="Annual hours of usable sunlight on the most optimal roof surfaces."
          />
          <MetricCard
            icon={Zap}
            label="Max Panel Count"
            value={potential.maxArrayPanelsCount || 'N/A'}
            description="The estimated maximum number of solar panels that can fit on your roof."
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
                   <FinancialSummary financialAnalysis={potential.financialAnalysis} yearlyEnergyDcKwh={potential.yearlyEnergyDcKwh || 0} />
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
      
      <div className="text-center pt-4">
        <Button onClick={onReset} size="lg">
          <RefreshCw className="mr-2 h-4 w-4" /> Start New Analysis
        </Button>
      </div>
    </div>
  );
}
