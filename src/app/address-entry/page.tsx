'use client';

import { useRouter } from 'next/navigation';
import type { AddressData } from '@/lib/types';
import AddressAutocomplete from '@/components/solar-navigator/address-autocomplete';
import { Card, CardContent } from '@/components/ui/card';
import { appConfig } from '@/lib/config';
import { useState } from 'react';

export default function AddressEntryPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const handleAddressSubmit = async (data: AddressData) => {
        // In a real app, save address to global state
        console.log('Address Data:', data);
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
