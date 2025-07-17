
'use client';

import { useState, useEffect } from 'react';
import EditorSidebar from '@/components/editor-sidebar';
import EditorCanvas, { PlacedImage } from '@/components/editor-canvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Save, Loader2, Settings } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import MobileImageTray from '@/components/mobile-image-tray';
import MobileControls from '@/components/mobile-controls';
import { useIsMobile } from '@/hooks/use-mobile';

export type CanvasSize = {
  id: string;
  name: string;
  width: string;
  height: string;
  dpi: number;
};

export type CanvasLayout = {
  id: string;
  name: string;
  grid: [number, number]; // [rows, columns]
};

const SIZES: CanvasSize[] = [
  { id: 'a4', name: 'A4', width: '210mm', height: '297mm', dpi: 300 },
  { id: 'a3', name: 'A3', width: '297mm', height: '420mm', dpi: 300 },
  { id: '4x6', name: '4x6 inches', width: '6in', height: '4in', dpi: 300 },
  { id: '100x148', name: '100x148 mm', width: '148mm', height: '100mm', dpi: 300 },
];

const LAYOUTS: CanvasLayout[] = [
  { id: '1x1', name: 'Single Image', grid: [1, 1] },
  { id: '1x2', name: '2 Images (Row)', grid: [1, 2] },
  { id: '2x1', name: '2 Images (Column)', grid: [2, 1] },
  { id: '2x2', name: '4 Images (Grid)', grid: [2, 2] },
  { id: '3x1', name: '3 Images (Row)', grid: [1, 3] },
  { id: '3x3', name: '9 Images (Grid)', grid: [3, 3] },
];

export type ObjectFit = 'cover' | 'contain';

export default function EditorPage() {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(SIZES.find(s => s.id === 'a4') || SIZES[0]);
  const [layout, setLayout] = useState<CanvasLayout>(LAYOUTS.find(l => l.id === '3x3') || LAYOUTS[0]);
  const [globalObjectFit, setGlobalObjectFit] = useState<ObjectFit>('cover');
  const [placedImages, setPlacedImages] = useState<(PlacedImage | null)[]>([]);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const handlePrint = () => {
    document.body.classList.add('printing');
    window.print();
    document.body.classList.remove('printing');
  };

  const toggleGlobalObjectFit = () => {
    setGlobalObjectFit(prev => prev === 'cover' ? 'contain' : 'cover');
  }

  const handlePlaceImageColumnWise = (imageUrl: string) => {
    const [rows, cols] = layout.grid;
    let nextEmptyIndex = -1;

    // Iterate column by column, then row by row
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const index = r * cols + c;
        if (!placedImages[index]) {
          nextEmptyIndex = index;
          break; // Exit inner loop
        }
      }
      if (nextEmptyIndex !== -1) {
        break; // Exit outer loop
      }
    }
    
    if (nextEmptyIndex !== -1) {
      const newPlacedImages = [...placedImages];
      newPlacedImages[nextEmptyIndex] = {
        src: imageUrl,
        objectFit: globalObjectFit,
        position: { x: 50, y: 50 },
        zoom: 1,
      };
      setPlacedImages(newPlacedImages);
    } else {
        toast({
            variant: "default",
            title: "Canvas Full",
            description: "No empty frames to place the image.",
        })
    }
  };

  const handlePlaceImageRowWise = (imageUrl: string) => {
    const nextEmptyIndex = placedImages.findIndex(img => img === null);
    
    if (nextEmptyIndex !== -1) {
      const newPlacedImages = [...placedImages];
      newPlacedImages[nextEmptyIndex] = {
        src: imageUrl,
        objectFit: 'cover', // Always fill the space on mobile tap
        position: { x: 50, y: 50 },
        zoom: 1,
      };
      setPlacedImages(newPlacedImages);
    } else {
        toast({
            variant: "default",
            title: "Canvas Full",
            description: "No empty frames to place the image.",
        })
    }
  };


  const handleSave = async () => {
    setIsSaving(true);
    const printableArea = document.getElementById('printable-area');
    if (printableArea) {
      printableArea.classList.add('is-saving');
      try {
        const canvas = await html2canvas(printableArea, {
            scale: 3, // Higher scale for better quality
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff'
        });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `photo-frame-${canvasSize.name.replace(/\s/g, '-')}-${layout.name.replace(/\s/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
            title: "Frame Saved",
            description: "Your frame has been downloaded as a high-quality PNG.",
        });
      } catch (error) {
        console.error("Failed to save canvas:", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save your frame as an image.",
        });
      } finally {
        printableArea.classList.remove('is-saving');
        setIsSaving(false);
      }
    } else {
        toast({
            variant: "destructive",
            title: "Save Error",
            description: "Could not find the printable area.",
        });
        setIsSaving(false);
    }
  };
  

  useEffect(() => {
    const totalFrames = layout.grid[0] * layout.grid[1];
    setPlacedImages(currentImages => {
      const newImages = Array(totalFrames).fill(null);
      for(let i = 0; i < Math.min(totalFrames, currentImages.length); i++) {
        if(currentImages[i]) {
          newImages[i] = currentImages[i];
        }
      }
      return newImages;
    });
  }, [layout]);


  return (
    <div id="editor-page-container" className="flex flex-col md:flex-row h-screen bg-muted/40">
      {/* Desktop Sidebar */}
      <div className='hidden md:block'>
        <EditorSidebar
          sizes={SIZES}
          layouts={LAYOUTS}
          selectedSize={canvasSize}
          onSizeChange={setCanvasSize}
          selectedLayout={layout}
          onLayoutChange={setLayout}
          onToggleGlobalFit={toggleGlobalObjectFit}
          globalFit={globalObjectFit}
          onPlaceImage={handlePlaceImageColumnWise}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 gap-2">
            <Button variant="outline" size="icon" asChild>
                <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
          <h1 className="text-xl font-semibold">Editor</h1>
          <div className='flex items-center gap-2'>
            <Button onClick={handleSave} disabled={isSaving} size="sm">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                <span className='hidden md:inline'>{isSaving ? "Saving..." : "Save"}</span>
            </Button>
            <Button onClick={handlePrint} size="sm">
                <Printer className="mr-2 h-4 w-4" />
                <span className='hidden md:inline'>Print</span>
            </Button>
            {/* Mobile Controls Sheet */}
            <div className='md:hidden'>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Open Controls</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Controls</SheetTitle>
                        </SheetHeader>
                        <MobileControls
                          sizes={SIZES}
                          layouts={LAYOUTS}
                          selectedSize={canvasSize}
                          onSizeChange={setCanvasSize}
                          selectedLayout={layout}
                          onLayoutChange={setLayout}
                          onToggleGlobalFit={toggleGlobalObjectFit}
                          globalFit={globalObjectFit}
                          closeSheet={() => setIsSheetOpen(false)}
                        />
                    </SheetContent>
                </Sheet>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <EditorCanvas 
                size={canvasSize} 
                layout={layout} 
                globalFit={globalObjectFit}
                placedImages={placedImages}
                setPlacedImages={setPlacedImages}
             />
        </div>
        
        {/* Mobile Image Tray */}
        <div className='md:hidden'>
          <MobileImageTray onPlaceImage={handlePlaceImageRowWise} />
        </div>
      </main>
    </div>
  );
}
