
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { appConfig } from '@/lib/config';
import { add, format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';

export default function SchedulingPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>();
  const [, setAppointmentData] = useLocalStorage('appointmentData', null);

  const today = new Date();
  const availableTimes = appConfig.scheduling.availableTimes;

  const handleSubmit = () => {
    if (!date || !time) {
      // In a real app, use a toast for errors
      alert('Please select a date and time.');
      return;
    }
    const appointment = {
      date: format(date, 'yyyy-MM-dd'),
      time: time,
    };
    setAppointmentData(appointment);
    router.push(appConfig.scheduling.nextPath);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-4xl mx-auto">
         <header className="text-center mb-8 flex flex-col items-center">
            {appConfig.global.logo && (
              <img src={appConfig.global.logo} alt={`${appConfig.global.appName} Logo`} className="h-12 w-auto mb-4" data-ai-hint="logo" />
            )}
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
                toDate={add(today, { days: appConfig.scheduling.bookingWindowDays })}
                className="rounded-md border"
              />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="font-semibold text-center md:text-left">
                {appConfig.scheduling.availableTimesLabel} {date ? format(date, 'PPP') : '...'}
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
                {appConfig.scheduling.submitButtonText} <ArrowRight className="ml-2" />
              </Button>
            </div>
        </Card>
      </div>
    </main>
  );
}
