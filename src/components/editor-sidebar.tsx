
'use client';

import { useImages } from '@/context/image-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CanvasSize, CanvasLayout, ObjectFit } from '@/app/editor/page';
import { Image as ImageIcon, ArrowLeftRight, RotateCw, Loader2, PlusCircle, ChevronsUpDown } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useRef, ChangeEvent } from 'react';
import { Separator } from './ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const { images, rotateImage, addImages } = useImages();
  const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);
  const [isAddingImages, setIsAddingImages] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleAddImagesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setIsAddingImages(true);
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

      if(imageFiles.length > 0) {
        await addImages(imageFiles);
      }
    }
    // Reset file input
    if(event.target) {
        event.target.value = "";
    }
    setIsAddingImages(false);
  };


  return (
    <aside className="w-80 border-r bg-background flex flex-col h-full">
       <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={isAddingImages}
        />
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Images</h2>
          <Button variant="ghost" size="sm" onClick={handleAddImagesClick} disabled={isAddingImages}>
              {isAddingImages ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Add
          </Button>
        </div>
        <div className="flex-1 min-h-0">
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
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                    <ImageIcon className="w-16 h-16 mb-4" />
                    <p>Click &quot;Add&quot; to upload images.</p>
                </div>
            )}
          </ScrollArea>
        </div>
      </div>
       <Separator />
      <Collapsible open={isControlsOpen} onOpenChange={setIsControlsOpen} className="border-t">
        <CollapsibleTrigger asChild>
            <div className="p-4 flex items-center justify-between cursor-pointer">
              <h2 className="text-xl font-semibold">Controls</h2>
              <Button variant="ghost" size="sm">
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle Controls</span>
              </Button>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <div className="p-4 pt-0 space-y-6">
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
        </CollapsibleContent>
      </Collapsible>
    </aside>
  );
}
