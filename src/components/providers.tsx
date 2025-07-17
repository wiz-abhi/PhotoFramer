'use client';

import { ReactNode } from 'react';
import { ImageProvider } from '@/context/image-context';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <ImageProvider>
        {children}
        <Toaster />
      </ImageProvider>
    </TooltipProvider>
  );
}
