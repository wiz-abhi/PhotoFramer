'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

type ImageContextType = {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
};

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<string[]>([]);

  return (
    <ImageContext.Provider value={{ images, setImages }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
}
