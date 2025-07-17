'use client';

import { useState, useEffect } from 'react';
import EditorSidebar from '@/components/editor-sidebar';
import EditorCanvas, { PlacedImage } from '@/components/editor-canvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Save, History } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

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
  { id: '100x148', name: '100x148 mm', width: '100mm', height: '148mm', dpi: 300 },
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

const LOCAL_STORAGE_KEY = 'photoFrameFactoryState';

type SavedState = {
  canvasSizeId: string;
  layoutId: string;
  globalObjectFit: ObjectFit;
  placedImages: (PlacedImage | null)[];
};

export default function EditorPage() {
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(SIZES.find(s => s.id === '100x148') || SIZES[0]);
  const [layout, setLayout] = useState<CanvasLayout>(LAYOUTS.find(l => l.id === '3x3') || LAYOUTS[0]);
  const [globalObjectFit, setGlobalObjectFit] = useState<ObjectFit>('cover');
  const [placedImages, setPlacedImages] = useState<(PlacedImage | null)[]>([]);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const toggleGlobalObjectFit = () => {
    setGlobalObjectFit(prev => prev === 'cover' ? 'contain' : 'cover');
  }

  const handleSave = () => {
    try {
      const stateToSave: SavedState = {
        canvasSizeId: canvasSize.id,
        layoutId: layout.id,
        globalObjectFit,
        placedImages,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      toast({
        title: "Frame Saved",
        description: "Your current layout has been saved successfully.",
      });
    } catch (error) {
      console.error("Failed to save state:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save your frame. Your browser storage might be full.",
      });
    }
  };

  const handleLoad = () => {
    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState: SavedState = JSON.parse(savedStateJSON);
        const newSize = SIZES.find(s => s.id === savedState.canvasSizeId) || canvasSize;
        const newLayout = LAYOUTS.find(l => l.id === savedState.layoutId) || layout;
        
        setCanvasSize(newSize);
        setLayout(newLayout);
        setGlobalObjectFit(savedState.globalObjectFit);
        setPlacedImages(savedState.placedImages);

        toast({
          title: "Frame Loaded",
          description: "Your last saved layout has been loaded.",
        });
      } else {
        toast({
            variant: "destructive",
            title: "No Saved Frame",
            description: "We couldn't find a previously saved frame.",
        });
      }
    } catch (error) {
      console.error("Failed to load state:", error);
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Could not load your saved frame. The data may be corrupted.",
      });
    }
  };

  useEffect(() => {
    handleLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

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
    <div className="flex h-screen bg-muted/40">
      <EditorSidebar
        sizes={SIZES}
        layouts={LAYOUTS}
        selectedSize={canvasSize}
        onSizeChange={setCanvasSize}
        selectedLayout={layout}
        onLayoutChange={setLayout}
        onToggleGlobalFit={toggleGlobalObjectFit}
        globalFit={globalObjectFit}
      />
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
            <Button onClick={handleLoad} variant="outline">
                <History className="mr-2 h-4 w-4" />
                Load
            </Button>
            <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
            </Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center">
            <EditorCanvas 
                size={canvasSize} 
                layout={layout} 
                globalFit={globalObjectFit}
                placedImages={placedImages}
                setPlacedImages={setPlacedImages}
             />
        </div>
      </main>
    </div>
  );
}
