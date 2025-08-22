'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { UploadCloud, File, X, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { appConfig } from '@/lib/config';

interface UploadedFile {
  file: File;
  id: string;
}

const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function FinancialDetailsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [monthlyBill, setMonthlyBill] = useState(appConfig.financialDetails.monthlyBill.defaultValue);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const remainingSlots = MAX_FILES - files.length;
      
      const filesToAdd: UploadedFile[] = [];
      const invalidFiles: string[] = [];

      newFiles.slice(0, remainingSlots).forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          invalidFiles.push(`"${file.name}" is larger than 5MB.`);
        } else {
          filesToAdd.push({ file, id: crypto.randomUUID() });
        }
      });
      
      if (invalidFiles.length > 0) {
        toast({
          variant: 'destructive',
          title: 'Some Files Were Too Large',
          description: invalidFiles.join(' '),
        });
      }

      setFiles(prevFiles => [...prevFiles, ...filesToAdd]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
  };

  const handleFormSubmit = () => {
    // In a real app, save this data to a global state
    const financialData = {
      monthlyBill,
      uploadedBills: files.map(f => f.file.name),
    };
    console.log('Financial Data:', financialData);
    
    // In a real app, this would be validated against the required files from config
    if (files.length < appConfig.financialDetails.fileUpload.requiredCount) {
         toast({
            variant: 'destructive',
            title: 'Missing Required Files',
            description: `Please upload at least ${appConfig.financialDetails.fileUpload.requiredCount} bill.`,
        });
        return;
    }
    
    router.push('/scheduling');
  };
  
  const uploadSlots = Array.from({ length: MAX_FILES });


  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">{appConfig.global.appName}</h1>
        </header>
        <Card className="w-full shadow-lg border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">{appConfig.financialDetails.title}</CardTitle>
            <CardDescription className="text-center">{appConfig.financialDetails.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-8 space-y-8">
            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle>{appConfig.financialDetails.monthlyBill.title}</CardTitle>
                <CardDescription>{appConfig.financialDetails.monthlyBill.description}</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Label htmlFor="monthly-bill">Average Monthly Electric Bill: ${monthlyBill}</Label>
                <Slider
                  id="monthly-bill"
                  min={appConfig.financialDetails.monthlyBill.min}
                  max={appConfig.financialDetails.monthlyBill.max}
                  step={appConfig.financialDetails.monthlyBill.step}
                  value={[monthlyBill]}
                  onValueChange={(value) => setMonthlyBill(value[0])}
                />
              </div>
            </div>

            <div>
              <CardHeader className="p-0 mb-4">
                <CardTitle>{appConfig.financialDetails.fileUpload.title}</CardTitle>
                <CardDescription>{appConfig.financialDetails.fileUpload.description}</CardDescription>
              </CardHeader>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {uploadSlots.map((_, index) => {
                    const fileData = files[index];
                    const isRequired = index < appConfig.financialDetails.fileUpload.requiredCount;
                    const label = appConfig.financialDetails.fileUpload.labels[index] || `File ${index + 1}`;

                    if (fileData) {
                        return (
                             <div key={fileData.id} className="relative group aspect-square border rounded-lg flex flex-col items-center justify-center p-2 text-center">
                                <File className="w-10 h-10 text-primary" />
                                <p className="text-xs font-medium truncate w-full mt-2">{fileData.file.name}</p>
                                <button onClick={() => removeFile(fileData.id)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )
                    }

                    return (
                        <div key={index} className="relative aspect-square border-2 border-dashed border-muted-foreground/50 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                             <UploadCloud className="w-8 h-8 text-muted-foreground mb-1" />
                             <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                             {isRequired && <p className="text-xs text-muted-foreground">(Required)</p>}
                             <Input
                                id={`file-upload-${index}`}
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept="application/pdf,image/*"
                                multiple={index === 0}
                             />
                        </div>
                    )
                 })}
              </div>
            </div>
            <div className="flex justify-end pt-4">
                <Button onClick={handleFormSubmit} size="lg">
                    Continue to Scheduling <ArrowRight/>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
