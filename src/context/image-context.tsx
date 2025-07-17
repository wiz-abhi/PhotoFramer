'use client';

import { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

type ImageContextType = {
  images: string[];
  setImages: Dispatch<SetStateAction<string[]>>;
  rotateImage: (index: number) => Promise<void>;
  processAndSetImages: (files: File[]) => Promise<void>;
  addImages: (files: File[]) => Promise<void>;
};

const ImageContext = createContext<ImageContextType | undefined>(undefined);

async function rotateImageUtil(imageUrl: string, direction: 'cw' | 'ccw' = 'cw'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      const angle = direction === 'cw' ? 90 : -90;
      ctx.rotate(angle * Math.PI / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      const newImageUrl = canvas.toDataURL();
      
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      
      resolve(newImageUrl);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image for rotation."));
    };
  });
}

export function ImageProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<string[]>([]);

  const rotateImage = async (index: number) => {
    const imageUrl = images[index];
    if (!imageUrl) return;

    try {
        const newImageUrl = await rotateImageUtil(imageUrl, 'ccw'); // Manual rotate is counter-clockwise
        setImages(prevImages => {
          const newImages = [...prevImages];
          newImages[index] = newImageUrl;
          return newImages;
        });
    } catch (error) {
        console.error("Failed to rotate image:", error);
    }
  };

  const processAndSetImages = async (files: File[]) => {
      const blobUrls = files.map(file => URL.createObjectURL(file));
      setImages(blobUrls);
  }

  const addImages = async (files: File[]) => {
    const blobUrls = files.map(file => URL.createObjectURL(file));
    setImages(prevImages => [...prevImages, ...blobUrls]);
  }

  return (
    <ImageContext.Provider value={{ images, setImages, rotateImage, processAndSetImages, addImages }}>
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
