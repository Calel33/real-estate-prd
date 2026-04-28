import Image from "next/image";
import type { StrapiMedia } from "@/lib/schemas/strapi";

interface GalleryPreviewProps {
  images: StrapiMedia[];
  strapiUrl: string;
}

/**
 * Gallery preview grid displayed on the homepage.
 * Shows property gallery images in a responsive grid layout.
 */
export function GalleryPreview({ images, strapiUrl }: GalleryPreviewProps) {
  if (images.length === 0) {
    return (
      <section aria-label="Gallery preview" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight text-center">
            Gallery Preview
          </h2>
          <p className="mt-4 text-secondary/70 text-lg text-center font-sans max-w-lg mx-auto">
            A glimpse of our properties
          </p>
          <p className="mt-8 text-secondary/50 text-center font-sans">
            No gallery images available for this property.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Gallery preview" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight text-center">
          Gallery Preview
        </h2>
        <p className="mt-4 text-secondary/70 text-lg text-center font-sans max-w-lg mx-auto">
          A glimpse of our properties
        </p>

        {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.documentId}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl"
            >
              <Image
                src={`${strapiUrl}${image.url}`}
                alt={image.alternativeText ?? image.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
