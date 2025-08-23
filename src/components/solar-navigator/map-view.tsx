
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader, AlertCircle, Layers, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { VisualizeSolarDataLayersOutput } from '@/lib/types';
import { renderGeoTiff } from '@/lib/geotiff-renderer';

interface MapViewProps {
  location: { lat: number; lng: number };
  visualizationData?: VisualizeSolarDataLayersOutput;
}

type Layer = 'buildingMask' | 'annualFlux' | 'monthlyFlux' | 'hourlyShade';
type ActiveLayers = { [key in Layer]?: boolean };

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
let googleMapsScriptLoadingPromise: Promise<void> | null = null;
const mapOverlays: Map<string, any> = new Map(); // Using a map to manage overlays

const loadGoogleMapsScript = () => {
  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,marker,maps&callback=initMap`;
    script.async = true;
    script.defer = true;
    (window as any).initMap = () => {
      resolve();
      delete (window as any).initMap;
    };
    script.onerror = (e) => {
      googleMapsScriptLoadingPromise = null;
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error("Google Maps script could not be loaded."));
    };
    document.head.appendChild(script);
  });
  return googleMapsScriptLoadingPromise;
};

// Define the custom overlay class once outside the component
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
        if (!overlayProjection || !this.div) return;
        const sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest())!;
        const ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast())!;
        if (sw && ne) {
            this.div.style.left = `${sw.x}px`;
            this.div.style.top = `${ne.y}px`;
            this.div.style.width = `${ne.x - sw.x}px`;
            this.div.style.height = `${sw.y - ne.y}px`;
        }
    }

    onRemove() {
        if (this.div) {
            (this.div.parentNode as HTMLElement).removeChild(this.div);
            delete this.div;
        }
    }
}

export default function MapView({ location, visualizationData }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading Map...');
  const [activeLayers, setActiveLayers] = useState<ActiveLayers>({ annualFlux: true });

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsApiLoaded(true))
      .catch((err) => setError("Mapping service could not be loaded."));
  }, []);

  useEffect(() => {
    if (isApiLoaded && mapRef.current && !map) {
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
    }
  }, [isApiLoaded, location, map]);

  const toggleLayer = useCallback(async (layer: Layer, url?: string) => {
    if (!map || !visualizationData?.boundingBox) return;
    
    // Toggle the state
    const isActivating = !activeLayers[layer];
    setActiveLayers(prev => ({ ...prev, [layer]: isActivating }));

    if (isActivating) {
      if (!url) {
        setError(`No URL available for the ${layer} layer.`);
        setActiveLayers(prev => ({ ...prev, [layer]: false }));
        return;
      }

      setLoadingMessage(`Rendering ${layer} layer...`);
      try {
        if (mapOverlays.has(layer)) {
            mapOverlays.get(layer).setMap(map);
            return;
        }
        
        const canvas = await renderGeoTiff(url, API_KEY!, layer);
        if (!canvas) throw new Error('GeoTIFF rendering returned null.');

        const { sw, ne } = visualizationData.boundingBox!;
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(sw.lat, sw.lng),
          new google.maps.LatLng(ne.lat, ne.lng)
        );

        const overlay = new CanvasOverlay(canvas, bounds);
        overlay.setMap(map);
        mapOverlays.set(layer, overlay);

      } catch (err: any) {
        setError(`Could not display ${layer} overlay: ${err.message}`);
        setActiveLayers(prev => ({ ...prev, [layer]: false }));
      } finally {
        setLoadingMessage('');
      }
    } else {
        if (mapOverlays.has(layer)) {
            mapOverlays.get(layer).setMap(null);
        }
    }
  }, [map, visualizationData, activeLayers]);

  // Effect to automatically render the annual flux layer on load
  useEffect(() => {
      if (map && visualizationData?.annualSolarFluxUrl && !mapOverlays.has('annualFlux')) {
          toggleLayer('annualFlux', visualizationData.annualSolarFluxUrl);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, visualizationData]);
  
  if (!API_KEY) {
    return (
      <Alert variant="destructive" className="m-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Configuration Error</AlertTitle><AlertDescription>Cannot display map without API key.</AlertDescription></Alert>
    );
  }

  const isLoading = !isApiLoaded || !!loadingMessage;

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative" data-ai-hint="map satellite">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}
      
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" className="shadow-md">
              <Layers className="mr-2 h-4 w-4" />
              Data Layers
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Toggle Overlays</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={activeLayers.annualFlux}
              onCheckedChange={() => toggleLayer('annualFlux', visualizationData?.annualSolarFluxUrl)}
              disabled={!visualizationData?.annualSolarFluxUrl}
            >
              Annual Sun Exposure
            </DropdownMenuCheckboxItem>
             <DropdownMenuCheckboxItem
              checked={activeLayers.buildingMask}
              onCheckedChange={() => toggleLayer('buildingMask', visualizationData?.buildingMaskUrl)}
              disabled={!visualizationData?.buildingMaskUrl}
            >
              Building Mask
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeLayers.monthlyFlux}
              onCheckedChange={() => toggleLayer('monthlyFlux', visualizationData?.monthlySolarFluxUrls?.[0])}
              disabled={!visualizationData?.monthlySolarFluxUrls || visualizationData.monthlySolarFluxUrls.length === 0}
            >
              Monthly Sun Exposure
            </DropdownMenuCheckboxItem>
             <DropdownMenuCheckboxItem
              checked={activeLayers.hourlyShade}
              onCheckedChange={() => toggleLayer('hourlyShade', visualizationData?.hourlyShadeUrls?.[0])}
              disabled={!visualizationData?.hourlyShadeUrls || visualizationData.hourlyShadeUrls.length === 0}
            >
              Hourly Shade (Dec)
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

       {error && (
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Map Overlay Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setError(null)}>
              <X className="h-4 w-4"/>
            </Button>
          </Alert>
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
