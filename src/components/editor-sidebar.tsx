'use client';

import { useImages } from '@/context/image-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CanvasSize, CanvasLayout } from '@/app/editor/page';
import { LayoutGrid, Image as ImageIcon } from 'lucide-react';

interface EditorSidebarProps {
  sizes: CanvasSize[];
  layouts: CanvasLayout[];
  selectedSize: CanvasSize;
  onSizeChange: (size: CanvasSize) => void;
  selectedLayout: CanvasLayout;
  onLayoutChange: (layout: CanvasLayout) => void;
}

export default function EditorSidebar({
  sizes,
  layouts,
  selectedSize,
  onSizeChange,
  selectedLayout,
  onLayoutChange,
}: EditorSidebarProps) {
  const { images } = useImages();

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, imageUrl: string) => {
    e.dataTransfer.setData('text/plain', imageUrl);
  };

  return (
    <aside className="w-80 border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Controls</h2>
      </div>
      <div className="p-4 space-y-6">
        <div>
          <Label htmlFor="canvas-size" className='text-base'>Canvas Size</Label>
          <Select
            value={selectedSize.id}
            onValueChange={(id) => {
              const newSize = sizes.find(s => s.id === id);
              if (newSize) onSizeChange(newSize);
            }}
          >
            <SelectTrigger id="canvas-size" className="w-full mt-2">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map(size => (
                <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="layout-type" className='text-base'>Layout</Label>
          <Select
            value={selectedLayout.id}
            onValueChange={(id) => {
              const newLayout = layouts.find(l => l.id === id);
              if (newLayout) onLayoutChange(newLayout);
            }}
          >
            <SelectTrigger id="layout-type" className="w-full mt-2">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              {layouts.map(layout => (
                <SelectItem key={layout.id} value={layout.id}>{layout.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex-1 min-h-0">
      <Card className="h-full rounded-none border-t border-b-0 border-x-0">
        <CardHeader className="border-b">
          <CardTitle>Your Images</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-4rem)]">
          <ScrollArea className="h-full p-4">
            {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                {images.map((src, index) => (
                    <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, src)}
                    className="aspect-square relative rounded-md overflow-hidden cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
                    >
                    <Image src={src} alt={`Uploaded image ${index + 1}`} layout="fill" objectFit="cover" />
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ImageIcon className="w-16 h-16 mb-4" />
                    <p className="text-center">Upload images on the home page to see them here.</p>
                </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      </div>
    </aside>
  );
}
