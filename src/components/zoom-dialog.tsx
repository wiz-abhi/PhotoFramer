'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Minus, Plus } from 'lucide-react';
import type { PlacedImage } from './editor-canvas';

interface ZoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  image: PlacedImage;
  onZoomChange: (zoom: number, applyToAll: boolean) => void;
}

export function ZoomDialog({ isOpen, onClose, image, onZoomChange }: ZoomDialogProps) {
  const [zoom, setZoom] = useState(image.zoom);
  const [applyToAll, setApplyToAll] = useState(false);

  useEffect(() => {
    setZoom(image.zoom);
  }, [image]);

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  const incrementZoom = () => setZoom(z => Math.min(z + 0.1, 5));
  const decrementZoom = () => setZoom(z => Math.max(z - 0.1, 0.1));

  const handleSaveChanges = () => {
    onZoomChange(zoom, applyToAll);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Zoom & Pan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className='text-sm text-muted-foreground'>
                Drag the image in the background to pan.
            </div>
            <div className="space-y-2">
                <Label htmlFor="zoom-slider">Zoom ({Math.round(zoom * 100)}%)</Label>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={decrementZoom}><Minus className="h-4 w-4" /></Button>
                    <Slider
                        id="zoom-slider"
                        min={0.1}
                        max={5}
                        step={0.01}
                        value={[zoom]}
                        onValueChange={handleZoomChange}
                    />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={incrementZoom}><Plus className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="apply-to-all" checked={applyToAll} onCheckedChange={(checked) => setApplyToAll(!!checked)} />
                <Label htmlFor="apply-to-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Apply to all images in the canvas
                </Label>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
