'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

type ImageContextType = {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  rotateImage: (index: number) => void;
};

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<string[]>([]);

  const rotateImage = (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous'; // In case of CORS issues, though unlikely with blob URLs
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Rotate the canvas context
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(90 * Math.PI / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      const newImageUrl = canvas.toDataURL();

      setImages(prevImages => {
        const newImages = [...prevImages];
        newImages[index] = newImageUrl;
        return newImages;
      });

      // Clean up the old blob URL if it is one
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image for rotation.");
    };
  };

  return (
    <ImageContext.Provider value={{ images, setImages, rotateImage }}>
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
