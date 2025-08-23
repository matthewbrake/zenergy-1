
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { appConfig } from '@/lib/config';
import { ArrowRight } from 'lucide-react';

export default function OtherServicesPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [creditScore, setCreditScore] = useState('');
  const [interestLevel, setInterestLevel] = useState('');

  const handleSubmit = () => {
    const formData = { description, creditScore, interestLevel };
    // In a real app, save to global state or send to CRM
    console.log('Other Services Data:', formData);
    router.push(appConfig.otherServices.nextPath);
  };

  const isFormComplete = description && creditScore && interestLevel;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-12 w-auto mb-4" data-ai-hint="logo" />
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{appConfig.otherServices.title}</CardTitle>
            <CardDescription>{appConfig.otherServices.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="description">{appConfig.otherServices.needsLabel}</Label>
              <Textarea
                id="description"
                placeholder={appConfig.otherServices.needsPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-4">
              <Label>{appConfig.otherServices.creditScoreLabel}</Label>
              <RadioGroup value={creditScore} onValueChange={setCreditScore} className="flex flex-col sm:flex-row gap-4">
                {appConfig.otherServices.creditScoreOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`credit-${option.value}`} />
                    <Label htmlFor={`credit-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <Label>{appConfig.otherServices.interestLevelLabel}</Label>
               <RadioGroup value={interestLevel} onValueChange={setInterestLevel} className="flex flex-col sm:flex-row gap-4">
                {appConfig.otherServices.interestLevelOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`interest-${option.value}`} />
                    <Label htmlFor={`interest-${option.value}`} className="font-normal">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSubmit} size="lg" disabled={!isFormComplete}>
                {appConfig.otherServices.submitButtonText} <ArrowRight className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
