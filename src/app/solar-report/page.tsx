
'use client';

import { useState, useEffect } from 'react';
import type { AddressData, AnalysisResult } from '@/lib/types';
import AnalysisDisplay from '@/components/solar-navigator/analysis-display';
import { getSolarAnalysis } from '@/lib/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Loader } from 'lucide-react';
import { appConfig } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/use-local-storage';

export default function SolarReportPage() {
  const [addressData] = useLocalStorage<AddressData | null>('addressData', null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (addressData) {
      const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        console.log(`[CLIENT] Initiating solar analysis for: ${addressData.address}`, addressData.location);
        const result = await getSolarAnalysis(addressData.location);

        if (result.success && result.data) {
          console.log('[CLIENT] Analysis successful.', result.data);
          setAnalysisResult(result.data);
        } else {
          console.error('[CLIENT] Analysis failed. Error received from server:', result.error);
          setError(result.error || 'An unknown error occurred during the analysis.');
        }
        setLoading(false);
      };
      runAnalysis();
    } else {
        // Handle case where address is not in local storage
        setError("No address found. Please go back and enter an address.");
        setLoading(false);
    }
  }, [addressData]);


  const handleReset = () => {
    localStorage.removeItem('addressData');
    router.push('/');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-96">
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">{appConfig.solarReport.loadingTitle}</h2>
          <p className="text-muted-foreground">{appConfig.solarReport.loadingDescription(addressData?.address || 'your address')}</p>
        </div>
      );
    }

    if (error) {
         return (
             <div className="flex flex-col items-center justify-center text-center p-8 h-96">
                <h2 className="text-2xl font-semibold text-destructive mb-2">{appConfig.solarReport.errorTitle}</h2>
                <p className="text-muted-foreground">{error}</p>
                 <Button onClick={handleReset} className="mt-4">{appConfig.solarReport.retryButton}</Button>
            </div>
         )
    }

    if (analysisResult && addressData) {
      return <AnalysisDisplay result={analysisResult} addressData={addressData} onReset={handleReset} />;
    }
    
    // Fallback for when there's no address data to begin with
    if (!addressData && !loading) {
        return (
             <div className="flex flex-col items-center justify-center text-center p-8 h-96">
                <h2 className="text-2xl font-semibold text-destructive mb-2">{appConfig.solarReport.noAddressTitle}</h2>
                <p className="text-muted-foreground">{appConfig.solarReport.noAddressDescription}</p>
                 <Button onClick={() => router.push('/address-entry')} className="mt-4">{appConfig.solarReport.goBackButton}</Button>
            </div>
        )
    }

    return null;
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-12 w-auto mb-4" data-ai-hint="logo" />
            )}
            {appConfig.global.displayAppName && (
                <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
            )}
            <p className="mt-2 text-lg text-muted-foreground">{appConfig.global.appDescription}</p>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardContent className="p-4 sm:p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
