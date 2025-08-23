
'use client';

import { useRouter } from 'next/navigation';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/lib/config';
import useLocalStorage from '@/hooks/use-local-storage';

export default function ServiceSelectionPage() {
  const router = useRouter();
  const [, setServiceChoice] = useLocalStorage('serviceChoice', null);
  const [, setProspectData] = useLocalStorage('prospectData', null);

  const handleServiceSelect = (service: { name: string; path: string; }) => {
    // For non-solar services, store the choice and go to prospect form first
    if (service.path === '/other-services') {
        setServiceChoice(service.name);
        router.push('/prospect-form');
    } else {
        // For solar, clear any previous service choice and go to its path
        setServiceChoice(null);
        router.push(service.path);
    }
  };

  return (
     <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-4xl mx-auto">
         <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-12 w-auto mb-4" data-ai-hint="logo" />
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
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                {appConfig.serviceSelection.services.map((service) => (
                  <Button
                    key={service.name}
                    variant="outline"
                    className="h-28 flex flex-col gap-2 border-2 text-base font-semibold hover:border-primary hover:bg-primary/10 data-[enabled=false]:opacity-50 data-[enabled=false]:pointer-events-none"
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
