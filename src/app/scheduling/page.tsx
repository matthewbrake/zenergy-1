'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { appConfig } from '@/lib/config';
import { add, format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

export default function SchedulingPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>();

  const today = new Date();
  const availableTimes = appConfig.scheduling.availableTimes;

  const handleSubmit = () => {
    if (!date || !time) {
      // In a real app, show a toast or error message
      alert('Please select a date and time.');
      return;
    }
    const appointment = {
      date: format(date, 'yyyy-MM-dd'),
      time: time,
    };
    // In a real app, save to global state
    console.log('Appointment Data:', appointment);
    router.push('/confirmation');
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-4xl mx-auto">
         <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{appConfig.scheduling.title}</CardTitle>
            <CardDescription>{appConfig.scheduling.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                fromDate={today}
                toDate={add(today, { days: 60 })}
                className="rounded-md border"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="font-semibold text-center md:text-left">
                Available Times for {date ? format(date, 'PPP') : '...'}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {availableTimes.map((availableTime) => (
                  <Button
                    key={availableTime}
                    variant={time === availableTime ? 'default' : 'outline'}
                    onClick={() => setTime(availableTime)}
                    disabled={!date}
                  >
                    {availableTime}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
           <div className="p-6 pt-0 flex justify-end">
              <Button onClick={handleSubmit} size="lg" disabled={!date || !time}>
                Confirm Appointment <ArrowRight />
              </Button>
            </div>
        </Card>
      </div>
    </main>
  );
}
