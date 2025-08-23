
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { appConfig } from '@/lib/config';
import useLocalStorage from '@/hooks/use-local-storage';

export default function FinancialDetailsPage() {
  const router = useRouter();
  const [addressData] = useLocalStorage('addressData', null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // This now just prevents the default and navigates.
    // The form data is sent directly to Formspree by the form itself.
    e.preventDefault(); 
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
             <div className="p-6 rounded-lg border text-center">
                <p className="text-muted-foreground">{appConfig.financialDetails.formspreeExplanation}</p>
                <Button 
                    onClick={() => window.open(appConfig.financialDetails.formspreeEndpoint, '_blank')} 
                    className="mt-4"
                    size="lg"
                >
                    {appConfig.financialDetails.formspreeButtonText}
                </Button>
            </div>
            
            <div className="mt-8 flex justify-end">
                <Button onClick={() => router.push(appConfig.financialDetails.nextPath)} size="lg" variant="outline">
                    {appConfig.financialDetails.skipButtonText} <ArrowRight className="ml-2"/>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
