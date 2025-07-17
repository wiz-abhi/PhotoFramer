
'use client';

import { useImages } from '@/context/image-context';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Image as ImageIcon, RotateCw, Loader2, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useRef, ChangeEvent } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MobileImageTrayProps {
    onPlaceImage: (imageUrl: string) => void;
}

export default function MobileImageTray({ onPlaceImage }: MobileImageTrayProps) {
  const { images, rotateImage, addImages } = useImages();
  const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);
  const [isAddingImages, setIsAddingImages] = useState(false);
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
  };

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
    if(event.target) {
        event.target.value = "";
    }
    setIsAddingImages(false);
  };

  return (
    <div className="border-t bg-background">
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isAddingImages}
      />
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-4">
          <Button 
            variant="outline"
            className="h-28 w-28 flex-col"
            onClick={handleAddImagesClick}
            disabled={isAddingImages}
          >
            {isAddingImages ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <PlusCircle className="h-6 w-6" />
            )}
            <span className="mt-2 text-xs">Add Images</span>
          </Button>

          {images.map((src, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, src)}
              onClick={() => onPlaceImage(src)}
              className="group aspect-square h-28 w-28 relative rounded-md overflow-hidden cursor-pointer active:cursor-grabbing shrink-0"
            >
              <Image src={src} alt={`Uploaded image ${index + 1}`} layout="fill" objectFit="cover" className='rounded-md' />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white h-10 w-10"
                    onClick={(e) => { e.stopPropagation(); onPlaceImage(src); }}
                    title="Add to canvas"
                    >
                    <PlusCircle className="h-5 w-5" />
                </Button>
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
          {images.length === 0 && (
             <div className="flex flex-col items-center justify-center h-28 text-muted-foreground text-center text-xs w-full">
                <p>Your uploaded images will appear here.</p>
             </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
