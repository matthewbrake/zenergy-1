'use client';

import { useRouter } from 'next/navigation';
import type { AddressData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { appConfig } from '@/lib/config';
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MapPin, Loader } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// --- AddressAutocomplete Component ---
// Note: This component is now co-located with the page for simplicity as it's only used here.

interface AddressAutocompleteProps {
  onSubmit: (data: AddressData) => void;
  error?: string | null;
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
                if (window.google && window.google.maps && window.google.maps.places && window.google.maps.marker) {
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
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,marker&callback=initMap`;
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

function AddressAutocomplete({ onSubmit, error }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

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

  if (!API_KEY) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
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
      <div className="p-4">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                ref={inputRef}
                placeholder="Enter a location"
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
            Select an address from the dropdown to automatically start the analysis.
          </p>
        </form>
      </div>
    </>
  );
}


// --- AddressEntryPage ---

export default function AddressEntryPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleAddressSubmit = async (data: AddressData) => {
        // In a real app, save address to global state
        localStorage.setItem('addressData', JSON.stringify(data));
        router.push('/solar-report');
    };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardContent className="p-4 sm:p-8">
            <AddressAutocomplete onSubmit={handleAddressSubmit} error={error} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
