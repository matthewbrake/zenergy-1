'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface MapViewProps {
  location: {
    lat: number;
    lng: number;
  };
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function MapView({ location }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsApiLoaded(true);
      return;
    }
    
    if (!API_KEY) return;

    const scriptId = 'google-maps-script';
    if(document.getElementById(scriptId)) {
        if(window.google) setIsApiLoaded(true);
        return;
    };

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    (window as any).initMap = () => setIsApiLoaded(true);
    document.head.appendChild(script);
    
    return () => {
      delete (window as any).initMap;
    }
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
      
      const boundsPadding = 0.0005;
      const overlayBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(location.lat - boundsPadding, location.lng - boundsPadding),
        new window.google.maps.LatLng(location.lat + boundsPadding, location.lng + boundsPadding)
      );

      class HeatmapOverlay extends window.google.maps.OverlayView {
        private bounds: google.maps.LatLngBounds;
        private div: HTMLDivElement | null = null;
      
        constructor(bounds: google.maps.LatLngBounds) {
          super();
          this.bounds = bounds;
        }
      
        onAdd() {
          this.div = document.createElement('div');
          this.div.style.borderStyle = 'none';
          this.div.style.borderWidth = '0px';
          this.div.style.position = 'absolute';
          this.div.style.background = 'linear-gradient(to top right, rgba(255, 235, 59, 0.4), rgba(244, 67, 54, 0.6))';
          this.div.style.opacity = '0.7';
          this.div.style.borderRadius = '8px';
      
          const panes = this.getPanes();
          panes?.overlayLayer.appendChild(this.div);
        }
      
        draw() {
          const overlayProjection = this.getProjection();
          const sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest())!;
          const ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast())!;
          
          if (this.div) {
              this.div.style.left = `${sw.x}px`;
              this.div.style.top = `${ne.y}px`;
              this.div.style.width = `${ne.x - sw.x}px`;
              this.div.style.height = `${sw.y - ne.y}px`;
          }
        }
      
        onRemove() {
          if (this.div) {
              (this.div.parentNode as HTMLElement).removeChild(this.div);
              this.div = null;
          }
        }
      }
      
      new HeatmapOverlay(overlayBounds).setMap(mapInstance);

      new window.google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: mapInstance,
      });
    }
  }, [isApiLoaded, location, map]);
  
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
