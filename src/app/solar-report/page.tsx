
'use client';

import { useState, useEffect } from 'react';
import type { AddressData, AnalysisResult } from '@/lib/types';
import AnalysisDisplay from '@/components/solar-navigator/analysis-display';
import { getSolarAnalysis } from '@/lib/actions';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, AlertTriangle } from 'lucide-react';
import { appConfig } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import useLocalStorage from '@/hooks/use-local-storage';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SolarReportPage() {
  const [addressData] = useLocalStorage<AddressData | null>('addressData', null);
  const [, setAnalysisResult] = useLocalStorage<AnalysisResult | null>('analysisResult', null);
  const [localAnalysisResult, setLocalAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(appConfig.solarReport.loading.initial);
  const router = useRouter();

  useEffect(() => {
    if (addressData) {
      const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        
        try {
          console.log(`[CLIENT] Initiating solar analysis for: ${addressData.address}`, addressData.location);
          setLoadingMessage(appConfig.solarReport.loading.fetching);
          
          const result = await getSolarAnalysis(addressData.location);

          if (result.success && result.data) {
            console.log('[CLIENT] Analysis successful.', result.data);
            setLoadingMessage(appConfig.solarReport.loading.rendering);
            setAnalysisResult(result.data); // Save full result to local storage
            setLocalAnalysisResult(result.data);
          } else {
            console.error('[CLIENT] Analysis failed. Error received from server:', result.error);
            setError(result.error || 'An unknown error occurred during the analysis.');
          }
        } catch (e: any) {
             console.error('[CLIENT] An unexpected error occurred in runAnalysis:', e);
             setError(`An unexpected client-side error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
      };
      runAnalysis();
    } else {
        setError("No address data found in your session. Please go back and enter an address.");
        setLoading(false);
    }
  }, [addressData, setAnalysisResult]);


  const handleReset = () => {
    localStorage.removeItem('addressData');
    localStorage.removeItem('prospectData');
    localStorage.removeItem('serviceChoice');
    localStorage.removeItem('analysisResult');
    router.push('/');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 h-96">
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">{appConfig.solarReport.loading.title}</h2>
          <p className="text-muted-foreground">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
         return (
             <div className="flex flex-col items-center justify-center text-center p-8 h-96">
                <Alert variant="destructive" className="max-w-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{appConfig.solarReport.errorTitle}</AlertTitle>
                  <AlertDescription>
                      <p className="mb-4">{error}</p>
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                          Please try another address or contact support if the issue persists.
                      </code>
                  </AlertDescription>
                </Alert>
                 <Button onClick={handleReset} className="mt-6">{appConfig.solarReport.retryButton}</Button>
            </div>
         )
    }

    if (localAnalysisResult && addressData) {
      return <AnalysisDisplay result={localAnalysisResult} addressData={addressData} onReset={handleReset} />;
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
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-20 w-auto mb-4" data-ai-hint="logo" />
            )}
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
