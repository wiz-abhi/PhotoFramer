
'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CanvasSize, CanvasLayout, ObjectFit } from '@/app/editor/page';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from './ui/button';

interface MobileControlsProps {
  sizes: CanvasSize[];
  layouts: CanvasLayout[];
  selectedSize: CanvasSize;
  onSizeChange: (size: CanvasSize) => void;
  selectedLayout: CanvasLayout;
  onLayoutChange: (layout: CanvasLayout) => void;
  onToggleGlobalFit: () => void;
  globalFit: ObjectFit;
  closeSheet: () => void;
}

export default function MobileControls({
  sizes,
  layouts,
  selectedSize,
  onSizeChange,
  selectedLayout,
  onLayoutChange,
  onToggleGlobalFit,
  globalFit,
  closeSheet
}: MobileControlsProps) {

  return (
    <div className="p-4 pt-4 space-y-6">
      <div>
        <Label htmlFor="m-canvas-size" className='text-base'>Canvas Size</Label>
        <Select
          value={selectedSize.id}
          onValueChange={(id) => {
            const newSize = sizes.find(s => s.id === id);
            if (newSize) onSizeChange(newSize);
            closeSheet();
          }}
        >
          <SelectTrigger id="m-canvas-size" className="w-full mt-2">
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
        <Label htmlFor="m-layout-type" className='text-base'>Layout</Label>
        <Select
          value={selectedLayout.id}
          onValueChange={(id) => {
            const newLayout = layouts.find(l => l.id === id);
            if (newLayout) onLayoutChange(newLayout);
            closeSheet();
          }}
        >
          <SelectTrigger id="m-layout-type" className="w-full mt-2">
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
        <Button onClick={() => { onToggleGlobalFit(); closeSheet(); }} variant="outline" className="w-full mt-2">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Toggle All to {globalFit === 'cover' ? 'Contain' : 'Cover'}
        </Button>
      </div>
    </div>
  );
}
