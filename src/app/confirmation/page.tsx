'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { appConfig } from '@/lib/config';
import { CheckCircle, Mail, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConfirmationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // This is a placeholder. In a real app, this would trigger a backend service.
    toast({
      title: 'Email Sent',
      description: 'A copy of your summary has been sent to your email address.',
    });
  };
  
  const startOver = () => {
    // In a real app, clear global state
    router.push('/');
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardHeader className="text-center items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <CardTitle className="text-3xl">{appConfig.confirmation.title}</CardTitle>
            <CardDescription>{appConfig.confirmation.description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* In a real app, this summary would be dynamically generated from global state */}
            <div className="p-6 rounded-lg bg-muted/50 border text-left">
                <h3 className="font-semibold mb-4">Your Summary</h3>
                <p><strong>Service:</strong> Solar Analysis</p>
                <p><strong>Address:</strong> 123 Main St, Anytown, USA</p>
                <p><strong>Appointment:</strong> Oct 26, 2024 at 10:00 AM</p>
            </div>

            <p className="text-muted-foreground">{appConfig.confirmation.nextSteps}</p>

            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={handleEmail} variant="outline">
                <Mail className="mr-2 h-4 w-4" /> Email Copy
              </Button>
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" /> Print Copy
              </Button>
            </div>
          </CardContent>
          <div className="p-6 pt-0 flex justify-center">
             <Button onClick={startOver} size="lg">Start a New Quote</Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
