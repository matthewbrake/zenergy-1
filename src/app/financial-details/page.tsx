
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ArrowRight } from 'lucide-react';
import { appConfig } from '@/lib/config';
import useLocalStorage from '@/hooks/use-local-storage';

export default function FinancialDetailsPage() {
  const router = useRouter();
  const [prospectData] = useLocalStorage('prospectData', null);
  const [addressData] = useLocalStorage('addressData', null);
  const [otherServicesData] = useLocalStorage('otherServicesData', null);
  const [serviceChoice] = useLocalStorage('serviceChoice', null);

  // State for this form
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [creditScore, setCreditScore] = useState('');
  const [interestLevel, setInterestLevel] = useState('');

  const isSolarPath = !serviceChoice; // If no service choice, it's the default solar path
  const isFormComplete = creditScore && interestLevel;


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically save this data to state or a CRM
    // For this app, we'll just navigate to the next step
    router.push(appConfig.financialDetails.nextPath);
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-12 w-auto mb-4" data-ai-hint="logo" />
            )}
            {appConfig.global.displayAppName && (
              <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
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
                    <Label htmlFor="monthly-bill">{appConfig.financialDetails.monthlyBillLabel}: ${monthlyBill}</Label>
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
                    <Label>{appConfig.financialDetails.creditScoreLabel}</Label>
                    <RadioGroup value={creditScore} onValueChange={setCreditScore} className="flex flex-col sm:flex-row gap-4">
                        {appConfig.financialDetails.creditScoreOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`credit-${option.value}`} />
                            <Label htmlFor={`credit-${option.value}`} className="font-normal">{option.label}</Label>
                        </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="space-y-4">
                    <Label>{appConfig.financialDetails.interestLevelLabel}</Label>
                    <RadioGroup value={interestLevel} onValueChange={setInterestLevel} className="flex flex-col sm:flex-row gap-4">
                        {appConfig.financialDetails.interestLevelOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`interest-${option.value}`} />
                            <Label htmlFor={`interest-${option.value}`} className="font-normal">{option.label}</Label>
                        </div>
                        ))}
                    </RadioGroup>
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{appConfig.financialDetails.billUploadTitle}</AlertTitle>
                    <AlertDescription>
                        {appConfig.financialDetails.billUploadDescription}
                    </AlertDescription>
                </Alert>
                
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
