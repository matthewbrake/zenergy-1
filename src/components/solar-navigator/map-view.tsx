
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
import type { DataLayersResponse } from '@/lib/types';
import { renderGeoTiff } from '@/lib/geotiff-renderer';

interface MapViewProps {
  location: { lat: number; lng: number };
  visualizationData?: DataLayersResponse;
}

type LayerType = 'buildingMask' | 'annualFlux' | 'monthlyFlux' | 'hourlyShade';

interface LayerState {
    id: LayerType;
    url?: string;
    label: string;
    active: boolean;
    disabled: boolean;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// --- Map Script Loader ---
// This ensures the Google Maps script is loaded only once.
let googleMapsScriptLoadingPromise: Promise<void> | null = null;
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

// --- Custom Canvas Overlay ---
// This class is responsible for placing the rendered GeoTIFF canvas onto the map.
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
        if (this.div && this.div.parentNode) {
            (this.div.parentNode as HTMLElement).removeChild(this.div);
            delete this.div;
        }
    }
    
    setMap(map: google.maps.Map | null) {
        super.setMap(map);
    }
}

export default function MapView({ location, visualizationData }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading Map...');
  const [layers, setLayers] = useState<LayerState[]>([]);
  
  // Use a ref to store overlays to avoid re-renders and manage their state.
  const overlaysRef = useRef<Map<LayerType, CanvasOverlay>>(new Map());

  // Effect to load the Google Maps script on component mount.
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setIsApiLoaded(true))
      .catch((err) => {
        console.error("MapView script loading error:", err)
        setError("Mapping service could not be loaded.");
      });
  }, []);
  
  // Effect to initialize the layer state once visualization data is available.
  useEffect(() => {
    if (visualizationData) {
      setLayers([
        { id: 'annualFlux', url: visualizationData.annualFluxUrl, label: 'Annual Sun Exposure', active: true, disabled: !visualizationData.annualFluxUrl },
        { id: 'buildingMask', url: visualizationData.maskUrl, label: 'Building Mask', active: false, disabled: !visualizationData.maskUrl },
        { id: 'monthlyFlux', url: visualizationData.monthlyFluxUrl, label: 'Monthly Sun Exposure', active: false, disabled: !visualizationData.monthlyFluxUrl },
        { id: 'hourlyShade', url: visualizationData.hourlyShadeUrls?.[0], label: 'Hourly Shade (Dec)', active: false, disabled: !visualizationData.hourlyShadeUrls || visualizationData.hourlyShadeUrls.length === 0 },
      ]);
    }
  }, [visualizationData]);

  // Effect to initialize the map itself once the API is loaded.
  useEffect(() => {
    if (isApiLoaded && mapRef.current && !map) {
      setLoadingMessage("Initializing map...");
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: location,
        zoom: 20,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        tilt: 0,
      });
      setMap(mapInstance);
      setLoadingMessage('');
      
      // Add a marker for the specified location.
      new window.google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: mapInstance,
      });
    }
  }, [isApiLoaded, location, map]);

  const toggleLayer = useCallback((layerId: LayerType) => {
    setLayers(prevLayers =>
        prevLayers.map(layer =>
            layer.id === layerId ? { ...layer, active: !layer.active } : layer
        )
    );
  }, []);

  // Main effect to manage rendering and removing layer overlays based on state.
  useEffect(() => {
    if (!map || !visualizationData?.boundingBox) return;
  
    const { sw, ne } = visualizationData.boundingBox;
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(sw.latitude, sw.longitude),
      new google.maps.LatLng(ne.latitude, ne.longitude)
    );
  
    layers.forEach(async (layer) => {
      const existingOverlay = overlaysRef.current.get(layer.id);

      // If layer should be active but there's no overlay, create it.
      if (layer.active && !existingOverlay) {
        if (!layer.url) {
          console.warn(`No URL for layer: ${layer.label}`);
          return;
        }
  
        setLoadingMessage(`Rendering ${layer.label}...`);
        try {
          // The renderGeoTiff function does the heavy lifting of fetching and drawing the image.
          const canvas = await renderGeoTiff(layer.url, API_KEY!, layer.id);
          if (canvas && map) { // Check if map is still mounted
            const overlay = new CanvasOverlay(canvas, bounds);
            overlaysRef.current.set(layer.id, overlay);
            overlay.setMap(map);
          } else {
             throw new Error('GeoTIFF rendering returned null or map was unmounted.');
          }
        } catch (err: any) {
          setError(`Could not display ${layer.label} overlay: ${err.message}`);
          // Deactivate layer on error to prevent trying again.
          setLayers(prev => prev.map(l => l.id === layer.id ? {...l, active: false} : l));
        } finally {
          setLoadingMessage('');
        }
      } 
      // If layer should be inactive but there's an overlay, remove it.
      else if (!layer.active && existingOverlay) {
        existingOverlay.setMap(null);
        overlaysRef.current.delete(layer.id);
      }
    });
  // This effect depends on the layers' active state and the map instance.
  }, [layers, map, visualizationData, API_KEY]);
  
  if (!API_KEY) {
    return (
      <Alert variant="destructive" className="m-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Configuration Error</AlertTitle><AlertDescription>Cannot display map without API key.</AlertDescription></Alert>
    );
  }

  const isLoading = !isApiLoaded || !map || !!loadingMessage;

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
            {layers.map(layer => (
                 <DropdownMenuCheckboxItem
                    key={layer.id}
                    checked={layer.active}
                    onCheckedChange={() => toggleLayer(layer.id)}
                    disabled={layer.disabled}
                 >
                    {layer.label}
                 </DropdownMenuCheckboxItem>
            ))}
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
