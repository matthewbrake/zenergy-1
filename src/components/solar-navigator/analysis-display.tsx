
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
  
  // Calculate a more robust viability score
  const viabilityScore = potential.solarPotential?.maxArrayPanelsCount && potential.solarPotential.maxSunshineHoursPerYear
    ? Math.round(
        ((potential.solarPotential.maxSunshineHoursPerYear / 2000) * 0.7 + // Weight sunshine hours
         (potential.solarPotential.maxArrayPanelsCount / 50) * 0.3) // Weight panel count
        * 100
      )
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
            label={appConfig.solarReport.metrics.viability.label}
            value={`${Math.min(viabilityScore, 100)}/100`}
            description={appConfig.solarReport.metrics.viability.description}
          />
          <MetricCard
            icon={Zap}
            label={appConfig.solarReport.metrics.panelCount.label}
            value={potential.maxArrayPanelsCount || 'N/A'}
            description={appConfig.solarReport.metrics.panelCount.description}
          />
          <MetricCard
            icon={Sun}
            label={appConfig.solarReport.metrics.savings.label}
            value={`${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(twentyYearSavings)}`}
            description={appConfig.solarReport.metrics.savings.description}
          />
           <MetricCard
            icon={Leaf}
            label={appConfig.solarReport.metrics.carbonOffset.label}
            value={`${carbonOffset.toFixed(0)} kg/MWh`}
            description={appConfig.solarReport.metrics.carbonOffset.description}
          />
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{appConfig.solarReport.details.title}</CardTitle>
          <CardDescription>{appConfig.solarReport.details.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue="financials">
            <AccordionItem value="financials">
              <AccordionTrigger className="text-lg font-semibold">{appConfig.solarReport.details.financials.title}</AccordionTrigger>
              <AccordionContent>
                {potential.financialAnalysis ? (
                   <FinancialSummary financialAnalysis={potential.financialAnalysis} solarPotential={potential} />
                ) : (
                  <p className="text-muted-foreground">{appConfig.solarReport.details.financials.noData}</p>
                )}
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="crm-data">
              <AccordionTrigger className="text-lg font-semibold">{appConfig.solarReport.details.crm.title}</AccordionTrigger>
              <AccordionContent>
                <CrmData result={result} addressData={addressData} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
      
      <div className="text-center pt-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-center sm:gap-4">
        <Button onClick={onReset} size="lg" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> {appConfig.solarReport.resetButton}
        </Button>
        <Button onClick={() => router.push(appConfig.solarReport.nextPath)} size="lg">
          {appConfig.solarReport.continueButton} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
