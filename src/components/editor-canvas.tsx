
'use client';

import { useState, DragEvent, useEffect } from 'react';
import type { CanvasSize, CanvasLayout, ObjectFit } from '@/app/editor/page';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ImageIcon, Trash2, ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';

interface EditorCanvasProps {
  size: CanvasSize;
  layout: CanvasLayout;
  globalFit: ObjectFit;
}

type PlacedImage = {
  src: string;
  objectFit: ObjectFit;
};

export default function EditorCanvas({ size, layout, globalFit }: EditorCanvasProps) {
  const [rows, cols] = layout.grid;
  const totalFrames = rows * cols;
  const [placedImages, setPlacedImages] = useState<(PlacedImage | null)[]>(Array(totalFrames).fill(null));

  useEffect(() => {
    // Reset canvas when layout or size changes
    setPlacedImages(Array(layout.grid[0] * layout.grid[1]).fill(null));
  }, [layout, size]);

  useEffect(() => {
    setPlacedImages(currentImages => 
        currentImages.map(img => img ? { ...img, objectFit: globalFit } : null)
    );
  }, [globalFit]);
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, frameIndex: number) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData('text/plain');
    if (imageUrl) {
      const newPlacedImages = [...placedImages];
      newPlacedImages[frameIndex] = { src: imageUrl, objectFit: globalFit };
      setPlacedImages(newPlacedImages);
    }
  };

  const removeImage = (frameIndex: number) => {
    const newPlacedImages = [...placedImages];
    newPlacedImages[frameIndex] = null;
    setPlacedImages(newPlacedImages);
  };
  
  const toggleObjectFit = (frameIndex: number) => {
    const newPlacedImages = [...placedImages];
    const image = newPlacedImages[frameIndex];
    if (image) {
      image.objectFit = image.objectFit === 'cover' ? 'contain' : 'cover';
      setPlacedImages(newPlacedImages);
    }
  };


  return (
    <div 
        id="printable-area" 
        className="printable-area"
        style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        <div
            className="bg-white shadow-lg mx-auto transition-all duration-300 ease-in-out"
            style={{
                width: size.width,
                height: size.height,
                maxWidth: '100%',
                maxHeight: '100%',
                aspectRatio: `auto ${parseInt(size.width)} / ${parseInt(size.height)}`
            }}
        >
            <div
                className="grid h-full w-full p-2 gap-2"
                style={{
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                }}
            >
                {Array.from({ length: totalFrames }).map((_, index) => (
                <div
                    key={index}
                    className={cn(
                    'relative group border-2 border-dashed rounded-md flex items-center justify-center transition-colors',
                    placedImages[index] ? 'border-primary/50 bg-primary/10' : 'bg-muted/50 border-muted-foreground/50'
                    )}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                >
                    {placedImages[index] ? (
                    <>
                        <Image
                            src={placedImages[index]!.src}
                            alt={`Placed image ${index}`}
                            layout="fill"
                            objectFit={placedImages[index]!.objectFit}
                            className="rounded-sm"
                        />
                        <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => removeImage(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                            </Button>
                             <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => toggleObjectFit(index)}
                                title="Toggle image fit"
                                >
                                    <ArrowLeftRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                    ) : (
                    <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-8 w-8 mb-1" />
                        <p className="text-xs">Drop image here</p>
                    </div>
                    )}
                </div>
                ))}
            </div>
        </div>
    </div>
  );
}
