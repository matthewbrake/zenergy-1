'use client';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sun, Wind, Thermometer, Home } from 'lucide-react';

interface ServiceSelectionProps {
  onSelect: (service: string) => void;
  prospectName: string;
}

const services = [
  { name: 'Solar', icon: Sun, enabled: true },
  { name: 'Roofing', icon: Home, enabled: false },
  { name: 'HVAC', icon: Wind, enabled: false },
  { name: 'Smart Home', icon: Thermometer, enabled: false },
];

export default function ServiceSelection({ onSelect, prospectName }: ServiceSelectionProps) {
  return (
    <div className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome, {prospectName}!</CardTitle>
        <CardDescription>What service are you interested in today?</CardDescription>
      </CardHeader>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {services.map((service) => (
          <Button
            key={service.name}
            variant="outline"
            className="h-28 flex flex-col gap-2 border-2 text-base font-semibold hover:border-primary hover:bg-primary/10 data-[enabled=false]:opacity-50 data-[enabled=false]:pointer-events-none"
            onClick={() => onSelect(service.name)}
            data-enabled={service.enabled}
            disabled={!service.enabled}
          >
            <service.icon className="w-8 h-8 text-primary" />
            {service.name}
            {!service.enabled && <span className="text-xs font-normal">(Coming Soon)</span>}
          </Button>
        ))}
      </div>
    </div>
  );
}
