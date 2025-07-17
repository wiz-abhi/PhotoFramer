'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useImages } from '@/context/image-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Home() {
  const { setImages } = useImages();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const files = event.target.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      
      if(imageFiles.length !== files.length) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Some files were not images and have been ignored.",
        });
      }

      if(imageFiles.length === 0) {
        toast({
          variant: "destructive",
          title: "No Images Selected",
          description: "Please select one or more image files.",
        });
        setIsLoading(false);
        return;
      }

      const imageUrls = imageFiles.map(file => URL.createObjectURL(file));
      setImages(imageUrls);
      router.push('/editor');
    } else {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Yes! This app works without internet after the first visit.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Card className="w-full max-w-lg text-center shadow-2xl animate-fade-in-up">
        <CardHeader>
          <div className="mx-auto bg-primary/20 text-primary p-3 rounded-full mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gallery-vertical-end"><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4"/><path d="M12 4v10"/><rect width="18" height="6" x="3" y="2"/><path d="m3 12 5-3 3 3 5-4 4 4"/></svg>
          </div>
          <CardTitle className="text-3xl font-bold">Photo Frame Factory</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Upload your memories, arrange them in beautiful layouts, and get them ready for printing.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
          <Button size="lg" className="w-full text-lg py-6" onClick={handleUploadClick} disabled={isLoading}>
            {isLoading ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
                <Upload className="mr-2 h-6 w-6" />
            )}
            {isLoading ? 'Processing...' : 'Upload Photos'}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            You can select one or multiple images.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
