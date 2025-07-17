'use client';

import { useState } from 'react';
import EditorSidebar from '@/components/editor-sidebar';
import EditorCanvas from '@/components/editor-canvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

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
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(SIZES[0]);
  const [layout, setLayout] = useState<CanvasLayout>(LAYOUTS[0]);
  const [globalObjectFit, setGlobalObjectFit] = useState<ObjectFit>('cover');

  const handlePrint = () => {
    window.print();
  };

  const toggleGlobalObjectFit = () => {
    setGlobalObjectFit(prev => prev === 'cover' ? 'contain' : 'cover');
  }

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
        <header className="flex h-14 items-center justify-between border-b bg-background px-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
          <h1 className="text-xl font-semibold">Editor</h1>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center">
            <EditorCanvas size={canvasSize} layout={layout} globalFit={globalObjectFit} />
        </div>
      </main>
    </div>
  );
}
