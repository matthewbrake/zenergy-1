'use client';

import { useRouter } from 'next/navigation';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/lib/config';

export default function ServiceSelectionPage() {
  const router = useRouter();

  const handleServiceSelect = (servicePath: string) => {
    // In a real app, you'd store the service selection in a state management solution (Context, Redux, Zustand)
    // For now, we'll just navigate.
    if (servicePath === '/solar') {
       router.push('/prospect-form');
    } else {
       router.push(servicePath);
    }
  };

  return (
     <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-4xl mx-auto">
         <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{appConfig.global.appDescription}</p>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{appConfig.serviceSelection.title}</CardTitle>
            <CardDescription>{appConfig.serviceSelection.description}</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                {appConfig.serviceSelection.services.map((service) => (
                  <Button
                    key={service.name}
                    variant="outline"
                    className="h-28 flex flex-col gap-2 border-2 text-base font-semibold hover:border-primary hover:bg-primary/10 data-[enabled=false]:opacity-50 data-[enabled=false]:pointer-events-none"
                    onClick={() => handleServiceSelect(service.path)}
                    data-enabled={service.enabled}
                    disabled={!service.enabled}
                  >
                    <service.icon className="w-8 h-8 text-primary" />
                    {service.name}
                    {!service.enabled && <span className="text-xs font-normal">(Coming Soon)</span>}
                  </Button>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
