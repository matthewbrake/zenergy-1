
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowRight } from 'lucide-react';
import { appConfig } from '@/lib/config';
import { useState } from 'react';

export default function FinancialDetailsPage() {
  const router = useRouter();
  const [monthlyBill, setMonthlyBill] = useState(appConfig.financialDetails.monthlyBill.defaultValue);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">{appConfig.financialDetails.title}</CardTitle>
            <CardDescription className="text-center">{appConfig.financialDetails.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            <form 
                action={appConfig.financialDetails.formspreeEndpoint}
                method="POST"
                className="space-y-8"
            >
                {/* Hidden field for monthly bill value */}
                <input type="hidden" name="monthly_bill" value={monthlyBill} />
                
                {/* In a real app, you would also pass other collected data as hidden fields */}
                {/* e.g., <input type="hidden" name="prospect_email" value={prospectData.email} /> */}
                 <input type="hidden" name="_next" value={appConfig.global.appUrl ? `${appConfig.global.appUrl}/scheduling` : undefined} />


                <div>
                  <CardHeader className="p-0 mb-4">
                    <CardTitle>{appConfig.financialDetails.monthlyBill.title}</CardTitle>
                    <CardDescription>{appConfig.financialDetails.monthlyBill.description}</CardDescription>
                  </CardHeader>
                  <div className="space-y-4">
                    <Label htmlFor="monthly-bill">Average Monthly Electric Bill: ${monthlyBill}</Label>
                    <Slider
                      id="monthly-bill"
                      min={appConfig.financialDetails.monthlyBill.min}
                      max={appConfig.financialDetails.monthlyBill.max}
                      step={appConfig.financialDetails.monthlyBill.step}
                      value={[monthlyBill]}
                      onValueChange={(value) => setMonthlyBill(value[0])}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg">
                       Continue <ArrowRight/>
                    </Button>
                </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
