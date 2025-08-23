
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRight, UploadCloud } from 'lucide-react';
import { appConfig } from '@/lib/config';
import useLocalStorage from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

export default function FinancialDetailsPage() {
  const router = useRouter();
  const [financialData, setFinancialData] = useLocalStorage('financialData', {
    monthlyBill: 150,
    creditScore: '',
    interestLevel: '',
  });

  const [serviceChoice] = useLocalStorage('serviceChoice', null);
  
  // Initialize local state with data from localStorage or defaults
  const [monthlyBill, setMonthlyBill] = useState(financialData.monthlyBill || 150);
  const [creditScore, setCreditScore] = useState(financialData.creditScore || '');
  const [interestLevel, setInterestLevel] = useState(financialData.interestLevel || '');
  
  const isSolarPath = serviceChoice === 'Solar';
  const isFormComplete = creditScore && interestLevel;
  
  // When component mounts, sync local state with localStorage
  useEffect(() => {
    setMonthlyBill(financialData.monthlyBill || 150);
    setCreditScore(financialData.creditScore || '');
    setInterestLevel(financialData.interestLevel || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Construct data object to save
    const dataToSave: any = {
      creditScore,
      interestLevel,
    };
    
    // Only include monthlyBill if it's the solar path
    if (isSolarPath) {
      dataToSave.monthlyBill = monthlyBill;
    }
    
    // Save the combined data to local storage
    setFinancialData(dataToSave);

    router.push(appConfig.financialDetails.nextPath);
  }

  const creditOptions = appConfig.financialDetails.creditScoreOptions;
  const interestOptions = appConfig.financialDetails.interestLevelOptions;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-20 w-auto mb-4" data-ai-hint="logo" />
            )}
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">{appConfig.financialDetails.title}</CardTitle>
            <CardDescription className="text-center">{appConfig.financialDetails.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {isSolarPath && (
                  <div className="space-y-4">
                    <Label htmlFor="monthly-bill" className="text-base">{appConfig.financialDetails.monthlyBillLabel}: <span className="font-bold text-primary">${monthlyBill}</span></Label>
                    <Slider
                      id="monthly-bill"
                      min={50}
                      max={1000}
                      step={10}
                      value={[monthlyBill]}
                      onValueChange={(value) => setMonthlyBill(value[0])}
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                    <Label className="text-base">{appConfig.financialDetails.creditScoreLabel}</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {creditOptions.map((option) => (
                         <Button
                            key={option.value}
                            type="button"
                            variant="outline"
                            className={cn(
                                "h-auto py-4 flex flex-col gap-1 border-2 text-base font-semibold hover:border-primary hover:bg-primary/10",
                                creditScore === option.value && "border-primary bg-primary/10"
                            )}
                            onClick={() => setCreditScore(option.value)}
                            >
                            <span>{option.label}</span>
                            <span className="text-sm font-normal text-muted-foreground">{option.range}</span>
                         </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base">{appConfig.financialDetails.interestLevelLabel}</Label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {interestOptions.map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            variant="outline"
                            className={cn(
                                "h-12 border-2 text-base font-semibold hover:border-primary hover:bg-primary/10",
                                interestLevel === option.value && "border-primary bg-primary/10"
                            )}
                            onClick={() => setInterestLevel(option.value)}
                            >
                            {option.label}
                        </Button>
                        ))}
                    </div>
                </div>

                {isSolarPath && (
                  <Alert className="bg-muted/30">
                      <UploadCloud className="h-4 w-4" />
                      <AlertTitle>{appConfig.financialDetails.billUploadTitle}</AlertTitle>
                      <AlertDescription>
                          {appConfig.financialDetails.billUploadDescription}
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                              {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center justify-center w-full">
                                    <label htmlFor={`dropzone-file-${i}`} className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-not-allowed bg-card/50 opacity-50">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Month {i}</span></p>
                                        </div>
                                    </label>
                                </div> 
                              ))}
                          </div>
                      </AlertDescription>
                  </Alert>
                )}
                
                <div className="mt-8 flex justify-end">
                    <Button type="submit" size="lg" disabled={!isFormComplete}>
                        {appConfig.financialDetails.submitButtonText} <ArrowRight className="ml-2"/>
                    </Button>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
