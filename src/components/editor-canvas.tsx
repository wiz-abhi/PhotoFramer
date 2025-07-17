
'use client';

import { useState, DragEvent, useEffect } from 'react';
import type { CanvasSize, CanvasLayout, ObjectFit } from '@/app/editor/page';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ImageIcon, Trash2, ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { ZoomDialog } from './zoom-dialog';

interface EditorCanvasProps {
  size: CanvasSize;
  layout: CanvasLayout;
  globalFit: ObjectFit;
}

export type PlacedImage = {
  src: string;
  objectFit: ObjectFit;
  position: { x: number; y: number }; // 0-100 for object-position
  zoom: number; // 1 = 100%
};

type DragState = {
  index: number;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
};

type EditingState = {
  index: number;
  image: PlacedImage;
};

export default function EditorCanvas({ size, layout, globalFit }: EditorCanvasProps) {
  const [rows, cols] = layout.grid;
  const totalFrames = rows * cols;
  const [placedImages, setPlacedImages] = useState<(PlacedImage | null)[]>(Array(totalFrames).fill(null));
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [editingImage, setEditingImage] = useState<EditingState | null>(null);

  useEffect(() => {
    // Reset canvas when layout or size changes
    setPlacedImages(Array(layout.grid[0] * layout.grid[1]).fill(null));
  }, [layout, size]);

  useEffect(() => {
    setPlacedImages(currentImages =>
        currentImages.map(img => img ? { ...img, objectFit: globalFit, zoom: 1, position: { x: 50, y: 50 } } : null)
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
      newPlacedImages[frameIndex] = { 
        src: imageUrl, 
        objectFit: globalFit,
        position: { x: 50, y: 50 }, // Center by default
        zoom: 1,
      };
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
      image.zoom = 1;
      image.position = {x: 50, y: 50};
      setPlacedImages(newPlacedImages);
    }
  };

  const onImageDragStart = (e: DragEvent<HTMLImageElement>, index: number) => {
    const imageState = placedImages[index];
    if (!imageState || imageState.objectFit === 'contain') {
      e.preventDefault();
      return;
    }
    // Set a transparent drag image
    const img = document.createElement('img');
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    e.dataTransfer.effectAllowed = 'move';

    setDragState({
        index,
        startX: e.clientX,
        startY: e.clientY,
        initialX: imageState.position.x,
        initialY: imageState.position.y
    });
  }

  const onImageDrag = (e: DragEvent<HTMLImageElement>) => {
    if (!dragState || e.clientX === 0 || e.clientY === 0) return; // Ignore final drag event with 0,0 coordinates

    const frame = e.currentTarget.parentElement;
    if (!frame) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    // Normalize by frame dimensions for consistent speed
    const deltaX = (dx / frame.clientWidth) * 100;
    const deltaY = (dy / frame.clientHeight) * 100;
    
    let newX = dragState.initialX - deltaX;
    let newY = dragState.initialY - deltaY;

    // Clamp values between 0 and 100
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));
    
    setPlacedImages(current => {
        const newImages = [...current];
        const image = newImages[dragState.index];
        if (image) {
            image.position = { x: newX, y: newY };
        }
        return newImages;
    });
  };

  const onImageDragEnd = () => {
    setDragState(null);
  }

  const handleDoubleClick = (index: number) => {
    const image = placedImages[index];
    if (image) {
      setEditingImage({ index, image });
    }
  };

  const handleZoomChange = (newZoom: number, applyToAll: boolean) => {
    if (editingImage) {
      if (applyToAll) {
        setPlacedImages(currentImages => 
          currentImages.map(img => img ? { ...img, zoom: newZoom } : null)
        );
      } else {
        setPlacedImages(currentImages => {
          const newImages = [...currentImages];
          const image = newImages[editingImage.index];
          if(image) {
            image.zoom = newZoom;
          }
          return newImages;
        });
      }
    }
  };

  return (
    <>
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
                    'relative group border-2 border-dashed rounded-md flex items-center justify-center transition-colors overflow-hidden',
                    placedImages[index] ? 'border-primary/50 bg-primary/10' : 'bg-muted/50 border-muted-foreground/50'
                    )}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDoubleClick={() => handleDoubleClick(index)}
                >
                    {placedImages[index] ? (
                    <>
                        <Image
                            src={placedImages[index]!.src}
                            alt={`Placed image ${index}`}
                            layout="fill"
                            objectFit={placedImages[index]!.objectFit}
                            style={{ 
                                objectPosition: `${placedImages[index]!.position.x}% ${placedImages[index]!.position.y}%`,
                                transform: `scale(${placedImages[index]!.zoom})`,
                                transition: 'transform 0.2s ease-out',
                            }}
                            className={cn(
                                'rounded-sm',
                                placedImages[index]!.objectFit === 'cover' && 'cursor-grab active:cursor-grabbing'
                            )}
                            draggable={placedImages[index]!.objectFit === 'cover'}
                            onDragStart={(e) => onImageDragStart(e, index)}
                            onDrag={onImageDrag}
                            onDragEnd={onImageDragEnd}
                            // Prevent native drag ghost for panning
                            onDragEnter={(e) => e.preventDefault()}
                        />
                        <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
    {editingImage && (
        <ZoomDialog
            isOpen={!!editingImage}
            onClose={() => setEditingImage(null)}
            image={editingImage.image}
            onZoomChange={handleZoomChange}
        />
    )}
    </>
  );
}
