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
        console.error("[MapView] Google Maps API key is missing.");
        return reject(new Error("Google Maps API key is missing."));
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,marker&callback=initMap`;
      script.async = true;
      script.defer = true;

      (window as any).initMap = () => {
        console.log("[MapView] LOG: Google Maps script initialized via callback.");
        resolve();
        delete (window as any).initMap;
      };

      script.onerror = (e) => {
        googleMapsScriptLoadingPromise = null;
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        console.error("[MapView] ERROR: Failed to load Google Maps script:", e);
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
  const overlayRef = useRef<any>(null);

  useEffect(() => {
    console.log('[MapView] LOG: Component mounted. Loading Google Maps script...');
    loadGoogleMapsScript()
      .then(() => {
        console.log('[MapView] LOG: Google Maps script loaded successfully.');
        setIsApiLoaded(true)
      })
      .catch(err => {
        console.error("[MapView] ERROR: Failed to load Google Maps script from useEffect:", err);
        setError("Mapping service could not be loaded.");
      });
  }, []);

  useEffect(() => {
    if (isApiLoaded && mapRef.current && !map) {
      console.log("[MapView] LOG: API loaded, initializing map at:", location);
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 20,
        mapId: 'SATELLITE',
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
      console.log("[MapView] LOG: Map initialized and marker placed.");
    }
  }, [isApiLoaded, location, map]);

  useEffect(() => {
    if (!map || !visualizationData?.annualSolarFluxUrl || !visualizationData?.boundingBox || !API_KEY) {
        if (!map) console.log("[MapView] LOG: Waiting for map to be initialized.");
        if (!visualizationData?.annualSolarFluxUrl) console.log("[MapView] LOG: Waiting for annualSolarFluxUrl in visualizationData.");
        if (!visualizationData?.boundingBox) console.log("[MapView] LOG: Waiting for boundingBox in visualizationData.");
        return;
    }

    // Define the custom overlay class inside the useEffect to ensure 'google' is defined
    class CanvasOverlay extends window.google.maps.OverlayView {
        private canvas: HTMLCanvasElement;
        private bounds: google.maps.LatLngBounds;
        private div?: HTMLDivElement;

        constructor(canvas: HTMLCanvasElement, bounds: google.maps.LatLngBounds) {
            super();
            this.canvas = canvas;
            this.bounds = bounds;
            console.log("[MapView] LOG: CanvasOverlay constructor called with canvas and bounds:", bounds.toJSON());
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
                console.log("[MapView] LOG: CanvasOverlay onAdd complete. Div appended to overlayLayer.");
            } else {
                console.error("[MapView] ERROR: Could not get map panes in onAdd.");
            }
        }

        draw() {
            const overlayProjection = this.getProjection();
            if (!overlayProjection || !this.div) {
                if (!overlayProjection) console.error("[MapView] ERROR: No overlay projection found in draw method.");
                if (!this.div) console.error("[MapView] ERROR: No div found in draw method.");
                return;
            }

            const sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest())!;
            const ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast())!;

            if (sw && ne) {
                this.div.style.left = `${sw.x}px`;
                this.div.style.top = `${ne.y}px`;
                this.div.style.width = `${ne.x - sw.x}px`;
                this.div.style.height = `${sw.y - ne.y}px`;
            } else {
                console.error("[MapView] ERROR: Could not calculate sw or ne points for projection.");
            }
        }

        onRemove() {
            if (this.div) {
                (this.div.parentNode as HTMLElement).removeChild(this.div);
                delete this.div;
                console.log("[MapView] LOG: CanvasOverlay onRemove complete.");
            }
        }
    }

    const renderOverlay = async () => {
      setIsRenderingOverlay(true);
      setError(null);
      console.log("[MapView] LOG: Map and visualization data are ready. Starting overlay render.");
      
      if (overlayRef.current) {
          overlayRef.current.setMap(null);
          console.log("[MapView] LOG: Removed previous overlay.");
      }

      try {
        console.log(`[MapView] LOG: Fetching and rendering GeoTIFF from: ${visualizationData.annualSolarFluxUrl}`);
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

        console.log("[MapView] LOG: GeoTIFF rendered to canvas successfully.");
        const overlay = new CanvasOverlay(canvas, bounds);
        overlay.setMap(map);
        overlayRef.current = overlay;
        console.log("[MapView] LOG: Canvas overlay has been set on the map.");

      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[MapView] ERROR: Failed to render solar overlay:', errorMessage);
        setError(`Could not display the solar potential overlay. ${errorMessage}`);
      } finally {
        setIsRenderingOverlay(false);
        console.log("[MapView] LOG: Overlay rendering process finished.");
      }
    };

    renderOverlay();

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
