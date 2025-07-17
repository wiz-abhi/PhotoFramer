'use client';

import { useImages } from '@/context/image-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CanvasSize, CanvasLayout, ObjectFit } from '@/app/editor/page';
import { Image as ImageIcon, ArrowLeftRight, RotateCw, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface EditorSidebarProps {
  sizes: CanvasSize[];
  layouts: CanvasLayout[];
  selectedSize: CanvasSize;
  onSizeChange: (size: CanvasSize) => void;
  selectedLayout: CanvasLayout;
  onLayoutChange: (layout: CanvasLayout) => void;
  onToggleGlobalFit: () => void;
  globalFit: ObjectFit;
}

export default function EditorSidebar({
  sizes,
  layouts,
  selectedSize,
  onSizeChange,
  selectedLayout,
  onLayoutChange,
  onToggleGlobalFit,
  globalFit
}: EditorSidebarProps) {
  const { images, rotateImage } = useImages();
  const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, imageUrl: string) => {
    e.dataTransfer.setData('text/plain', imageUrl);
  };

  const handleRotate = async (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (rotatingIndex !== null) return;
    setRotatingIndex(index);
    await rotateImage(index);
    setRotatingIndex(null);
  }

  return (
    <aside className="w-80 border-r bg-background flex flex-col">
      <div className="flex-1 min-h-0">
      <Card className="h-full rounded-none border-t-0 border-b-0 border-x-0">
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
                      className="group aspect-square relative rounded-md overflow-hidden cursor-grab active:cursor-grabbing transition-transform hover:scale-105"
                    >
                      <Image src={src} alt={`Uploaded image ${index + 1}`} layout="fill" objectFit="cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 hover:text-white h-10 w-10"
                            onClick={(e) => handleRotate(e, index)}
                            title="Rotate 90 degrees"
                            disabled={rotatingIndex !== null}
                          >
                              {rotatingIndex === index ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <RotateCw className="h-5 w-5" />
                              )}
                          </Button>
                      </div>
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
       <div className="p-4 border-t">
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
         <div>
            <Label className="text-base">Image Fit</Label>
            <Button onClick={onToggleGlobalFit} variant="outline" className="w-full mt-2">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Toggle All to {globalFit === 'cover' ? 'Contain' : 'Cover'}
            </Button>
         </div>
      </div>
    </aside>
  );
}
