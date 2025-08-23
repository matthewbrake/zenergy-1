
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProspectSchema, type ProspectData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, Building, Phone, Mail } from 'lucide-react';
import { appConfig } from '@/lib/config';
import useLocalStorage from '@/hooks/use-local-storage';


export default function ProspectFormPage() {
    const router = useRouter();
    const [, setProspectData] = useLocalStorage('prospectData', null);
    const [serviceChoice] = useLocalStorage('serviceChoice', null);
    
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
        setProspectData(data);
        // If a service choice was made (e.g., Roofing), go to the other services page.
        // Otherwise, it's the solar path, so go to address entry.
        const nextPath = serviceChoice ? appConfig.prospectForm.nextPath.other : appConfig.prospectForm.nextPath.solar;
        router.push(nextPath);
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
                     <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{appConfig.prospectForm.title}</CardTitle>
                        <CardDescription>{appConfig.prospectForm.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
