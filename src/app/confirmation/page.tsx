
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { appConfig } from '@/lib/config';
import { CheckCircle, Mail, Printer, RotateCcw, Home, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { useEffect, useState } from 'react';
import type { AnalysisResult } from '@/lib/types';

export default function ConfirmationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [prospectData] = useLocalStorage('prospectData', null);
  const [addressData] = useLocalStorage('addressData', null);
  const [appointmentData] = useLocalStorage('appointmentData', null);
  const [otherServicesData] = useLocalStorage('otherServicesData', null);
  const [serviceChoice] = useLocalStorage('serviceChoice', null);
  const [financialData] = useLocalStorage('financialData', null);
  const [analysisResult] = useLocalStorage<AnalysisResult | null>('analysisResult', null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // This effect runs once when the component mounts to submit all collected data.
  useEffect(() => {
    const submitAllData = async () => {
      // Prevent re-submission if already submitting or submitted
      if (isSubmitting || !prospectData) return;
      
      setIsSubmitting(true);

      // Consolidate all data from local storage into a single object
      const finalSubmissionData = {
        ...prospectData,
        serviceChoice,
        address: addressData,
        financials: financialData,
        appointment: appointmentData,
        otherServiceNeeds: otherServicesData,
        solarAnalysis: serviceChoice === 'Solar' && analysisResult ? analysisResult : undefined,
      };

      try {
        const response = await fetch("https://formspree.io/f/mrblnyld", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(finalSubmissionData, null, 2),
        });

        if (response.ok) {
          toast({
            title: "Quote Submitted Successfully!",
            description: "We've received your information and will be in touch shortly.",
            variant: "default",
          });
        } else {
          throw new Error('Form submission failed.');
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast({
          title: "Submission Error",
          description: "There was a problem submitting your information. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };
    
    submitAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount


  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // This is a placeholder. In a real app, this would trigger a backend service.
    toast({
      title: appConfig.confirmation.emailSuccessTitle,
      description: appConfig.confirmation.emailSuccessDescription,
    });
  };
  
  const startOver = () => {
    // Clear all persistent data
    localStorage.clear();
    router.push('/');
  };

  const renderServiceSpecificDetails = () => {
    // If 'otherServicesData' exists, it means the user came from the HVAC/Roofing/Smart Home flow.
    if (otherServicesData && serviceChoice && serviceChoice !== 'Solar') {
      const serviceTypeLabel = appConfig.otherServices.serviceTypeOptions.find(o => o.value === otherServicesData.serviceType)?.label;

      return (
        <>
            <div className="flex items-center justify-center gap-2">
                <Home className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-lg">{serviceChoice} Service Details</h3>
            </div>
            {serviceTypeLabel && <p><strong>Service Type:</strong> {serviceTypeLabel}</p>}
            {otherServicesData.description && <p><strong>Needs:</strong> {otherServicesData.description}</p>}
        </>
      )
    }

    // Otherwise, show solar details.
    return (
       <>
            <div className="flex items-center justify-center gap-2">
                <Sun className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-lg">Solar Analysis Details</h3>
            </div>
            {addressData && <p><strong>{appConfig.confirmation.summaryAddressLabel}:</strong> {addressData.address}</p>}
       </>
    )
  }
  
  const renderFinancialDetails = () => {
    if (!financialData) return null;
    return (
        <div className="space-y-1 text-center">
            {financialData.monthlyBill && <p><strong>Avg. Monthly Bill:</strong> ${financialData.monthlyBill}</p>}
            {financialData.creditScore && <p><strong>Credit Score:</strong> {appConfig.financialDetails.creditScoreOptions.find(o => o.value === financialData.creditScore)?.label}</p>}
            {financialData.interestLevel && <p><strong>Interest Level:</strong> {appConfig.financialDetails.interestLevelOptions.find(o => o.value === financialData.interestLevel)?.label}</p>}
        </div>
    )
  }


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-20 w-auto mb-4" data-ai-hint="logo" />
            )}
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardHeader className="text-center items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <CardTitle className="text-3xl">{appConfig.confirmation.title}</CardTitle>
            <CardDescription>{appConfig.confirmation.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            
            <div className="p-6 rounded-lg bg-muted/50 border text-left space-y-3">
                <h3 className="font-semibold mb-4 text-lg text-center">{appConfig.confirmation.summaryTitle}</h3>
                
                {/* Prospect Details */}
                {prospectData && (
                    <div className="space-y-1">
                        <p><strong>{appConfig.confirmation.summaryNameLabel}:</strong> {prospectData.firstName} {prospectData.lastName}</p>
                        <p><strong>Email:</strong> {prospectData.email}</p>
                        <p><strong>Phone:</strong> {prospectData.phone}</p>
                    </div>
                )}
                
                <hr className="my-4 border-dashed" />

                {/* Service Specific Details */}
                <div className="space-y-1 text-center">
                   {renderServiceSpecificDetails()}
                </div>

                 <hr className="my-4 border-dashed" />
                
                {/* Financial Details */}
                {renderFinancialDetails()}
                
                <hr className="my-4 border-dashed" />

                {/* Appointment Details */}
                {appointmentData && (
                    <div className="space-y-1 text-center">
                        <p><strong>{appConfig.confirmation.summaryAppointmentLabel}:</strong> {appointmentData.date} at {appointmentData.time}</p>
                    </div>
                )}
            </div>

            <p className="text-muted-foreground">{appConfig.confirmation.nextSteps}</p>

            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={handleEmail} variant="outline">
                <Mail className="mr-2 h-4 w-4" /> {appConfig.confirmation.emailButton}
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" /> {appConfig.confirmation.printButton}
              </Button>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-center">
             <Button onClick={startOver} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              {appConfig.confirmation.startOverButton}
             </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
