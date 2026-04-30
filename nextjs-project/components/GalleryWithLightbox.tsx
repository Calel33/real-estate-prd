"use client";

import { useState, useCallback } from "react";
import type { StrapiMedia } from "@/lib/schemas/strapi";
import { ImageGalleryGrid } from "./ImageGalleryGrid";
import { Lightbox } from "./Lightbox";

interface GalleryWithLightboxProps {
  images: StrapiMedia[];
  strapiUrl: string;
}

/**
 * Client component that combines the image gallery grid with a lightbox.
 * Manages the open/close state and current image index.
 */
export function GalleryWithLightbox({
  images,
  strapiUrl,
}: GalleryWithLightboxProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const navigate = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <>
      <ImageGalleryGrid
        images={images}
        strapiUrl={strapiUrl}
        onImageClick={openLightbox}
      />

      <Lightbox
        images={images}
        strapiUrl={strapiUrl}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        onNavigate={navigate}
      />
    </>
  );
}
