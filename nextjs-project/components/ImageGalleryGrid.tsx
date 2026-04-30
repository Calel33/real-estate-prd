import Image from "next/image";
import type { StrapiMedia } from "@/lib/schemas/strapi";

interface ImageGalleryGridProps {
  images: StrapiMedia[];
  strapiUrl: string;
  /** Called when an image is clicked (to open lightbox) */
  onImageClick?: (index: number) => void;
}

/**
 * Full image gallery grid displayed on the property detail page.
 * Shows all gallery images in a responsive grid with click-to-enlarge.
 */
export function ImageGalleryGrid({
  images,
  strapiUrl,
  onImageClick,
}: ImageGalleryGridProps) {
  if (images.length === 0) {
    return (
      <section
        aria-label="Property image gallery"
        className="py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
            Gallery
          </h2>
          <p className="mt-8 text-secondary/50 text-center font-sans">
            No gallery images available for this property.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Property image gallery" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
          Gallery
        </h2>

        {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <button
              key={image.documentId}
              type="button"
              onClick={() => onImageClick?.(index)}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              aria-label={`View ${image.alternativeText ?? image.name}`}
            >
              <Image
                src={`${strapiUrl}${image.url}`}
                alt={image.alternativeText ?? image.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
