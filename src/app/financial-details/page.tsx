'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { UploadCloud, File, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FinancialDetailsPage() {
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const validFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: 'destructive',
            title: 'File Too Large',
            description: `"${file.name}" is larger than 5MB and was not added.`,
          });
          return false;
        }
        return true;
      });
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleFormSubmit = () => {
    // This is where you would handle the form submission,
    // e.g., send data to a CRM or backend service.
    toast({
        title: "Information Submitted",
        description: "Your financial details and bills have been recorded."
    });
  };


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Financial Details</h1>
            <p className="mt-2 text-lg text-muted-foreground">Help us refine your savings estimate.</p>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardContent className="p-4 sm:p-8 space-y-8">
            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle>Your Energy Usage</CardTitle>
                <CardDescription>Adjust the slider to match your average monthly electricity bill.</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Label htmlFor="monthly-bill">Average Monthly Electric Bill: ${monthlyBill}</Label>
                <Slider
                  id="monthly-bill"
                  min={25}
                  max={1000}
                  step={5}
                  value={[monthlyBill]}
                  onValueChange={(value) => setMonthlyBill(value[0])}
                />
              </div>
            </div>

            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle>Upload Your Bills</CardTitle>
                <CardDescription>Please upload your last 1-3 electricity bills (PDF or images, under 5MB each). At least last month's bill is required.</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Drag & drop files here, or click to select files</p>
                    <Input
                        id="file-upload"
                        type="file"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        accept="application/pdf,image/*"
                    />
                     <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                        Select Files
                    </Button>
                </div>
                {files.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Selected Files:</h4>
                        <ul className="space-y-2">
                            {files.map((file, index) => (
                                <li key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <File className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{file.name}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button onClick={handleFormSubmit} size="lg">
                    Submit & Continue
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}