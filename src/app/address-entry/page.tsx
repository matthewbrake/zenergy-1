
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { AddressData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { appConfig } from '@/lib/config';
import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MapPin, Loader, SkipForward } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';

// --- AddressAutocomplete Component ---
interface AddressAutocompleteProps {
  onSubmit: (data: AddressData) => void;
  error?: string | null;
  initialAddress?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let googleMapsScriptLoadingPromise: Promise<void> | null = null;

const loadGoogleMapsScript = () => {
    if (googleMapsScriptLoadingPromise) {
        return googleMapsScriptLoadingPromise;
    }
    googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) {
            const checkGoogle = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    clearInterval(checkGoogle);
                    resolve();
                }
            }, 100);
            return;
        }

        if (!API_KEY) {
           console.error("Google Maps API key is missing.");
           return reject(new Error("Google Maps API key is missing."));
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`;
        script.async = true;
        script.defer = true;
        
        (window as any).initMap = () => {
          resolve();
          delete (window as any).initMap;
        };
        
        script.onerror = (e) => {
            googleMapsScriptLoadingPromise = null;
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
            console.error("Failed to load Google Maps script:", e);
            reject(new Error("Google Maps script could not be loaded."));
        }

        document.head.appendChild(script);
      });
      return googleMapsScriptLoadingPromise;
};

function AddressAutocomplete({ onSubmit, error, initialAddress }: AddressAutocompleteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  
  const nextPath = appConfig.featureFlags.solarAnalysisEnabled ? '/solar-report' : '/financial-details';


  useEffect(() => {
    if(inputRef.current && initialAddress) {
        inputRef.current.value = initialAddress;
    }
  }, [initialAddress]);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsApiLoaded(true))
      .catch(err => {
        console.error("Failed to load Google Maps script from useEffect:", err);
        setSelectionError("Could not load mapping service. Please check your API key and network connection.");
      });
  }, []);

  useEffect(() => {
    if (!isApiLoaded || !inputRef.current) return;

    if (inputRef.current.getAttribute('data-autocomplete-attached')) {
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ["address_components", "geometry", "place_id", "formatted_address"],
    });
    inputRef.current.setAttribute('data-autocomplete-attached', 'true');

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      setSelectionError(null);

      if (!place.geometry || !place.geometry.location) {
        setSelectionError("Please select a valid address from the dropdown.");
        return;
      }
      
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      setIsGeocoding(true);
      const addressData: AddressData = {
        placeId: place.place_id!,
        address: place.formatted_address || '',
        location: { lat, lng },
      };
      setIsGeocoding(false);
      onSubmit(addressData);
    });
  }, [isApiLoaded, onSubmit]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectionError("Please select an address from the suggestions list before submitting.");
  };

  const skipStep = () => {
    router.push(nextPath);
  }

  if (!API_KEY) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          {appConfig.addressEntry.apiKeyMissingError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{appConfig.addressEntry.title}</CardTitle>
        <CardDescription>{appConfig.addressEntry.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-8">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">{appConfig.addressEntry.addressLabel}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                ref={inputRef}
                placeholder={appConfig.addressEntry.placeholder}
                disabled={!isApiLoaded || isGeocoding}
                className="pl-10"
              />
              {!isApiLoaded && (
                <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
            </div>
          </div>
          {(error || selectionError) && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || selectionError}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground text-center">
            {appConfig.addressEntry.instructions}
          </p>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
          <Button onClick={skipStep} variant="link">
             <SkipForward className="mr-2 h-4 w-4" />
             Skip to Next Step
          </Button>
      </CardFooter>
    </>
  );
}


function AddressEntryComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialAddress = searchParams.get('address') || '';

    const [, setAddressData] = useLocalStorage('addressData', null);

    const handleAddressSubmit = async (data: AddressData) => {
        setAddressData(data); // Save address to local storage via custom hook
        const nextPath = appConfig.featureFlags.solarAnalysisEnabled ? '/solar-report' : '/financial-details';
        router.push(nextPath);
    };
    return (
        <Card className="w-full shadow-lg border-2 border-primary/20">
            <AddressAutocomplete onSubmit={handleAddressSubmit} initialAddress={initialAddress} />
        </Card>
    )
}

// --- AddressEntryPage ---
export default function AddressEntryPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-20 w-auto mb-4" data-ai-hint="logo" />
            )}
        </header>
        <Suspense fallback={
            <div className="flex items-center justify-center text-center p-8 h-96">
              <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
            </div>
        }>
            <AddressEntryComponent />
        </Suspense>
      </div>
    </main>
  );
}
