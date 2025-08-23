
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProspectSchema, type ProspectData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, Building, Phone, Mail, Sun, Home, Wind, Thermometer } from 'lucide-react';
import { appConfig } from '@/lib/config';
import useLocalStorage from '@/hooks/use-local-storage';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


export default function ServiceSelectionPage() {
  const router = useRouter();
  const [, setProspectData] = useLocalStorage('prospectData', null);
  const [, setServiceChoice] = useLocalStorage('serviceChoice', null);
  const [selectedService, setSelectedService] = useState<{ name: string; path: string; } | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const form = useForm<ProspectData>({
    resolver: zodResolver(ProspectSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      companyName: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = (data: ProspectData) => {
    if (!selectedService) {
        setSelectionError('Please select a service before continuing.');
        return;
    }
    setSelectionError(null);
    setProspectData(data);
    setServiceChoice(selectedService.name);
    router.push(selectedService.path);
  };

  const handleServiceSelect = (service: { name: string; path: string; }) => {
    setSelectedService(service);
    setSelectionError(null); // Clear error when a service is selected
  };

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-16 w-auto mb-4" data-ai-hint="logo" />
            )}
            {appConfig.global.displayAppName && (
              <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
            )}
            <p className="mt-2 text-lg text-muted-foreground">{appConfig.global.appDescription}</p>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">{appConfig.serviceSelection.title}</CardTitle>
                <CardDescription>{appConfig.serviceSelection.description}</CardDescription>
            </CardHeader>
            <CardContent>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Step 1: Service Selection */}
                    <div className="space-y-4">
                        <FormLabel className="text-base font-semibold">{appConfig.serviceSelection.step1Title}</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-md border border-input">
                            {appConfig.serviceSelection.services.map((service) => (
                              <Button
                                key={service.name}
                                type="button"
                                variant="outline"
                                className={cn(
                                    "h-28 flex flex-col gap-2 border-2 text-base font-semibold hover:border-primary hover:bg-primary/10 data-[enabled=false]:opacity-50 data-[enabled=false]:pointer-events-none",
                                    selectedService?.name === service.name && "border-primary bg-primary/10"
                                )}
                                onClick={() => handleServiceSelect(service)}
                                data-enabled={service.enabled}
                                disabled={!service.enabled}
                              >
                                <service.icon className="w-8 h-8 text-primary" />
                                {service.name}
                                {!service.enabled && <span className="text-xs font-normal">({appConfig.serviceSelection.comingSoonText})</span>}
                              </Button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Prospect Information */}
                    <div className="space-y-4">
                        <FormLabel className="text-base font-semibold">{appConfig.prospectForm.step2Title}</FormLabel>
                        <div className="p-4 space-y-6 rounded-md border border-input">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>{appConfig.prospectForm.firstNameLabel}</FormLabel>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                        <Input placeholder={appConfig.prospectForm.firstNamePlaceholder} {...field} className="pl-10" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>{appConfig.prospectForm.lastNameLabel}</FormLabel>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                        <Input placeholder={appConfig.prospectForm.lastNamePlaceholder} {...field} className="pl-10" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{appConfig.prospectForm.companyNameLabel}</FormLabel>
                                    <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder={appConfig.prospectForm.companyNamePlaceholder} {...field} className="pl-10" />
                                    </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{appConfig.prospectForm.phoneLabel}</FormLabel>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input
                                                        placeholder={appConfig.prospectForm.phonePlaceholder}
                                                        {...field}
                                                        onChange={(e) => {
                                                            const formatted = formatPhoneNumber(e.target.value);
                                                            field.onChange(formatted);
                                                        }}
                                                        className="pl-10"
                                                    />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>{appConfig.prospectForm.emailLabel}</FormLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                        <Input placeholder={appConfig.prospectForm.emailPlaceholder} {...field} className="pl-10" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {selectionError && (
                         <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Selection Required</AlertTitle>
                          <AlertDescription>{selectionError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                            {appConfig.prospectForm.submitButtonText}
                        </Button>
                    </div>
                </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
