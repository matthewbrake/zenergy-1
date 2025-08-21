'use client';

import { useState } from 'react';
import type { ProspectData, AddressData, AnalysisResult } from '@/lib/types';
import ProspectForm from '@/components/solar-navigator/prospect-form';
import ServiceSelection from '@/components/solar-navigator/service-selection';
import AddressAutocomplete from '@/components/solar-navigator/address-autocomplete';
import AnalysisDisplay from '@/components/solar-navigator/analysis-display';
import { getSolarAnalysis } from '@/lib/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';

type Step = 'prospect-info' | 'service-selection' | 'address-input' | 'loading' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('prospect-info');
  const [prospectData, setProspectData] = useState<ProspectData | null>(null);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProspectSubmit = (data: ProspectData) => {
    setProspectData(data);
    setStep('service-selection');
  };

  const handleServiceSelect = () => {
    setStep('address-input');
  };

  const handleAddressSubmit = async (data: AddressData) => {
    setAddressData(data);
    setStep('loading');
    setError(null);

    console.log(`[CLIENT] Initiating solar analysis for: ${data.address}`, data.location);
    const result = await getSolarAnalysis(data.location);

    if (result.success && result.data) {
      console.log('[CLIENT] Analysis successful.', result.data);
      setAnalysisResult(result.data);
      setStep('results');
    } else {
      console.error('[CLIENT] Analysis failed. Error received from server:', result.error);
      setError(result.error || 'An unknown error occurred.');
      setStep('address-input'); // Go back to address step on error
    }
  };

  const handleReset = () => {
    setStep('prospect-info');
    setProspectData(null);
    setAddressData(null);
    setAnalysisResult(null);
    setError(null);
  };

  const renderStep = () => {
    switch (step) {
      case 'prospect-info':
        return <ProspectForm onSubmit={handleProspectSubmit} />;
      case 'service-selection':
        return <ServiceSelection onSelect={handleServiceSelect} prospectName={prospectData?.firstName || 'prospect'} />;
      case 'address-input':
        return <AddressAutocomplete onSubmit={handleAddressSubmit} error={error} />;
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">Analyzing Solar Potential</h2>
            <p className="text-muted-foreground">This may take a moment. We're gathering satellite imagery and solar data for {addressData?.address}.</p>
          </div>
        );
      case 'results':
        return analysisResult && addressData && <AnalysisDisplay result={analysisResult} addressData={addressData} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Solaris Navigator</h1>
            <p className="mt-2 text-lg text-muted-foreground">Your API-Driven Solar Sales Funnel</p>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardContent className="p-4 sm:p-8">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
