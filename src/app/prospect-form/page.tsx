
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


export default function ProspectFormPage() {
    const router = useRouter();
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
        // In a real app, save this to a global state
        console.log('Prospect Data:', data);
        router.push('/address-entry');
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
            <div className="w-full max-w-2xl mx-auto">
                 <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
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
                                    <FormLabel>First Name</FormLabel>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                        <Input placeholder="John" {...field} className="pl-10" />
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
                                    <FormLabel>Last Name</FormLabel>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                        <Input placeholder="Doe" {...field} className="pl-10" />
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
                                    <FormLabel>Company Name</FormLabel>
                                    <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <FormControl>
                                        <Input placeholder="ACME Inc." {...field} className="pl-10" />
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
                                    <FormLabel>Phone Number</FormLabel>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                        <Input placeholder="(555) 123-4567" {...field} className="pl-10" />
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
                                    <FormLabel>Email Address</FormLabel>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                        <Input placeholder="john.doe@acme.com" {...field} className="pl-10" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                                Continue
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
