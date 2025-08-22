'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { VisualizeSolarDataLayersOutput } from '@/lib/types';
import { renderGeoTiff } from '@/lib/geotiff-renderer';

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
  if (!googleMapsScriptLoadingPromise) {
    googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) {
        const checkGoogle = setInterval(() => {
          if (window.google?.maps?.marker) {
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
      };

      document.head.appendChild(script);
    });
  }
  return googleMapsScriptLoadingPromise;
};

export default function MapView({ location, visualizationData }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRenderingOverlay, setIsRenderingOverlay] = useState(false);

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsApiLoaded(true))
      .catch(err => {
        console.error("[MapView] Failed to load Google Maps script:", err);
        setError("Mapping service could not be loaded.");
      });
  }, []);

  useEffect(() => {
    if (isApiLoaded && mapRef.current && !map) {
      console.log("[MapView] API loaded, initializing map.");
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
  }, [isApiLoaded, location, map]);

  useEffect(() => {
    if (map && visualizationData?.annualSolarFluxUrl && visualizationData?.boundingBox && API_KEY) {
      setIsRenderingOverlay(true);
      setError(null);
      console.log("[MapView] Map and visualization data are ready. Starting overlay render.");
      
      // Define the overlay class *inside* the effect, so it only runs on the client
      class CanvasOverlay extends google.maps.OverlayView {
          private canvas: HTMLCanvasElement;
          private bounds: google.maps.LatLngBounds;
          private div?: HTMLDivElement;

          constructor(canvas: HTMLCanvasElement, bounds: google.maps.LatLngBounds) {
              super();
              this.canvas = canvas;
              this.bounds = bounds;
          }

          onAdd() {
              this.div = document.createElement('div');
              this.div.style.borderStyle = 'none';
              this.div.style.borderWidth = '0px';
              this.div.style.position = 'absolute';
              this.div.appendChild(this.canvas);
              
              const panes = this.getPanes();
              if (panes) {
                  panes.overlayLayer.appendChild(this.div);
              }
          }

          draw() {
              const overlayProjection = this.getProjection();
              if (!overlayProjection || !this.div) {
                  return;
              }

              const sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest())!;
              const ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast())!;

              this.div.style.left = `${sw.x}px`;
              this.div.style.top = `${ne.y}px`;
              this.div.style.width = `${ne.x - sw.x}px`;
              this.div.style.height = `${sw.y - ne.y}px`;
          }

          onRemove() {
              if (this.div) {
                  (this.div.parentNode as HTMLElement).removeChild(this.div);
                  delete this.div;
              }
          }
      }

      const renderOverlay = async () => {
        try {
          console.log(`[MapView] Fetching and rendering GeoTIFF from: ${visualizationData.annualSolarFluxUrl}`);
          const { sw, ne } = visualizationData.boundingBox!;
          const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(sw.lat, sw.lng),
            new google.maps.LatLng(ne.lat, ne.lng)
          );

          const canvas = await renderGeoTiff(
            visualizationData.annualSolarFluxUrl!,
            API_KEY!
          );
          
          if (!canvas) {
            throw new Error('GeoTIFF rendering returned null canvas.');
          }

          console.log("[MapView] GeoTIFF rendered to canvas successfully.");
          const overlay = new CanvasOverlay(canvas, bounds);
          overlay.setMap(map);
          console.log("[MapView] Canvas overlay added to the map.");

        } catch (err: any) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.error('[MapView] Failed to render solar overlay:', errorMessage);
          setError('Could not display the solar potential overlay. The data might be unavailable for this specific location.');
        } finally {
          setIsRenderingOverlay(false);
          console.log("[MapView] Overlay rendering process finished.");
        }
      };

      renderOverlay();
    }
  }, [map, visualizationData, API_KEY]);
  
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
      {(!isApiLoaded || isRenderingOverlay) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              {!isApiLoaded ? 'Loading Map...' : 'Rendering Solar Data...'}
            </p>
          </div>
        </div>
      )}
       {error && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Overlay Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
