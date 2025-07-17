
'use client';

import { useState, DragEvent, Dispatch, SetStateAction } from 'react';
import type { CanvasSize, CanvasLayout, ObjectFit } from '@/app/editor/page';
import { cn } from '@/lib/utils';
import { ImageIcon, Trash2, ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';
import { ZoomDialog } from './zoom-dialog';

export type PlacedImage = {
  src: string;
  objectFit: ObjectFit;
  position: { x: number; y: number }; // 0-100 for object-position
  zoom: number; // 1 = 100%
};

interface EditorCanvasProps {
  size: CanvasSize;
  layout: CanvasLayout;
  globalFit: ObjectFit;
  placedImages: (PlacedImage | null)[];
  setPlacedImages: Dispatch<SetStateAction<(PlacedImage | null)[]>>;
}

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

export default function EditorCanvas({ size, layout, globalFit, placedImages, setPlacedImages }: EditorCanvasProps) {
  const [rows, cols] = layout.grid;
  const totalFrames = rows * cols;
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [editingImage, setEditingImage] = useState<EditingState | null>(null);

  
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

  const onImagePanStart = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const imageState = placedImages[index];
    if (!imageState || imageState.objectFit === 'contain') {
      return;
    }

    setDragState({
        index,
        startX: e.clientX,
        startY: e.clientY,
        initialX: imageState.position.x,
        initialY: imageState.position.y
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      setDragState(currentDragState => {
        if (!currentDragState) {
          return null;
        }
        const dx = moveEvent.clientX - currentDragState.startX;
        const dy = moveEvent.clientY - currentDragState.startY;
    
        const frame = (e.target as HTMLElement).closest('.image-frame');
        if (!frame) return currentDragState;
    
        const deltaX = (dx / frame.clientWidth) * 100;
        const deltaY = (dy / frame.clientHeight) * 100;
        
        let newX = currentDragState.initialX - deltaX;
        let newY = currentDragState.initialY - deltaY;
    
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));
        
        setPlacedImages(current => {
            const newImages = [...current];
            const image = newImages[currentDragState.index];
            if (image) {
                image.position = { x: newX, y: newY };
            }
            return newImages;
        });

        return currentDragState;
      });
    }

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        setDragState(null);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


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
        className="bg-white shadow-lg mx-auto transition-all duration-300 ease-in-out printable-area"
        style={{
            width: size.width,
            height: size.height,
            maxWidth: '100%',
            maxHeight: '100%',
            aspectRatio: `auto ${parseInt(size.width)} / ${parseInt(size.height)}`
        }}
    >
        <div
            className="grid h-full w-full p-0.5 gap-0.5"
            style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }}
        >
            {Array.from({ length: totalFrames }).map((_, index) => {
              const image = placedImages[index];
              return (
                <div
                    key={index}
                    className={cn(
                      'relative group border-2 border-dashed rounded-md flex items-center justify-center transition-colors overflow-hidden frame-container',
                      image ? 'border-transparent' : 'border-muted-foreground/50 is-empty'
                    )}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDoubleClick={() => handleDoubleClick(index)}
                >
                    {image ? (
                    <>
                        <div
                          className={cn(
                            'w-full h-full rounded-sm bg-no-repeat image-frame',
                            image.objectFit === 'cover' ? 'cursor-grab active:cursor-grabbing' : ''
                          )}
                          onMouseDown={image.objectFit === 'cover' ? (e) => onImagePanStart(e, index) : undefined}
                          style={{
                            backgroundImage: `url('${image.src}')`,
                            backgroundSize: image.objectFit === 'contain' 
                              ? 'contain' 
                              : `${image.zoom * 100}%`,
                            backgroundPosition: `${image.position.x}% ${image.position.y}%`,
                            transition: 'background-size 0.2s ease-out',
                            aspectRatio: '30 / 40',
                          }}
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
                    <div className="text-center text-muted-foreground placeholder-content">
                        <ImageIcon className="mx-auto h-8 w-8 mb-1" />
                        <p className="text-xs">Drop image here</p>
                    </div>
                    )}
                </div>
              )
            })}
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
