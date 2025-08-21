'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { VisualizeSolarDataLayersOutput } from '@/lib/types';

interface MapViewProps {
  location: {
    lat: number;
    lng: number;
  };
  visualizationData?: VisualizeSolarDataLayersOutput;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let googleMapsScriptLoadingPromise: Promise<void> | null = null;

const loadGoogleMapsScript = () => {
    if (googleMapsScriptLoadingPromise) {
        return googleMapsScriptLoadingPromise;
    }
    googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places && window.google.maps.marker) {
            return resolve();
        }
        if (!API_KEY) {
            console.error("Google Maps API key is missing.");
            return reject(new Error("Google Maps API key is missing."));
        }

        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) {
            // If script tag exists, wait for it to load
            const interval = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.places && window.google.maps.marker) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,marker&callback=initMap`;
        script.async = true;
        script.defer = true;

        (window as any).initMap = () => {
            delete (window as any).initMap; // Clean up the callback
            resolve();
        };

        script.onerror = (e) => {
            console.error("Failed to load Google Maps script:", e);
            googleMapsScriptLoadingPromise = null;
            document.head.removeChild(script);
            reject(new Error("Google Maps script could not be loaded."));
        };
        
        document.head.appendChild(script);
    });
    return googleMapsScriptLoadingPromise;
};


export default function MapView({ location, visualizationData }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsApiLoaded(true))
      .catch(err => console.error("Failed to load Google Maps script:", err));
  }, []);

  useEffect(() => {
    if (isApiLoaded && mapRef.current && !map) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 20,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        tilt: 0,
      });
      setMap(mapInstance);
      
      new window.google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: mapInstance,
      });
    }
    
    // Add overlay once the map is initialized and visualization data is available
    if (map && visualizationData?.annualSolarFluxUrl && visualizationData?.boundingBox) {
        const { sw, ne } = visualizationData.boundingBox;
        const fluxOverlay = new window.google.maps.GroundOverlay(
           visualizationData.annualSolarFluxUrl,
           { south: sw.lat, west: sw.lng, north: ne.lat, east: ne.lng },
           { opacity: 0.6 }
        );
        fluxOverlay.setMap(map);
    }

  }, [isApiLoaded, location, map, visualizationData]);
  
  if (!API_KEY) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/50 rounded-lg">
        <Alert variant="destructive" className="w-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>Cannot display map without API key.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative" data-ai-hint="map satellite">
      {!isApiLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
