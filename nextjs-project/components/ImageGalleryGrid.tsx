import Image from "next/image";
import type { StrapiMedia } from "@/lib/schemas/strapi";

interface ImageGalleryGridProps {
  images: StrapiMedia[];
  strapiUrl: string;
  /** Called when an image is clicked (to open lightbox) */
  onImageClick?: (index: number) => void;
}

/**
 * Returns grid column span classes based on image index for the mosaic layout.
 * Pattern: large (8-col) → medium (4-col, tall) → 3× small (4-col, short) → repeat small
 */
function getMosaicSpan(index: number): {
  col: string;
  lgCol: string;
  height: string;
} {
  if (index === 0) {
    return {
      col: "col-span-12",
      lgCol: "lg:col-span-8",
      height: "h-[400px] md:h-[500px]",
    };
  }
  if (index === 1) {
    return {
      col: "col-span-12",
      lgCol: "lg:col-span-4",
      height: "h-[400px] md:h-[500px]",
    };
  }
  return {
    col: "col-span-12",
    lgCol: "lg:col-span-4",
    height: "h-[250px] md:h-[300px]",
  };
}

/**
 * Generates a technical-looking label for gallery images.
 * Uses the image index and alt text to create scan codes.
 */
function getImageTag(index: number, image: StrapiMedia): string {
  const scanNum = String(index + 1).padStart(2, "0");
  const alt = image.alternativeText ?? image.name ?? "Image";
  const label = alt
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 24);
  return `Scn_${scanNum} / ${label || "View"}`;
}

/**
 * Mosaic image gallery grid with grayscale hover effects and technical tags.
 * Ported from the Emri Village monolith reference design:
 *   - 12-column mosaic grid with varying image sizes
 *   - Grayscale filter with smooth color reveal on hover
 *   - Technical scan-code tags that fade in on hover
 *   - Click-to-enlarge with lightbox integration
 */
export function ImageGalleryGrid({
  images,
  strapiUrl,
  onImageClick,
}: ImageGalleryGridProps) {
  if (images.length === 0) {
    return (
      <section aria-label="Property image gallery" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-primary/40 mb-2 block">
                Aerial_Documentation
              </span>
              <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
                Site_Gallery.
              </h2>
            </div>
          </div>
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
        {/* Gallery header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-primary/40 mb-2 block">
              Aerial_Documentation
            </span>
            <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
              Site_Gallery.
            </h2>
          </div>
          <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-secondary/20 hidden md:block">
            Ref_Scans_01-{String(images.length).padStart(2, "0")}
          </span>
        </div>

        {/* Mosaic grid: 12-column layout with varying spans */}
        <div className="grid grid-cols-12 gap-[15px]">
          {images.map((image, index) => {
            const { col, lgCol, height } = getMosaicSpan(index);
            const tag = getImageTag(index, image);

            return (
              <button
                key={image.documentId}
                type="button"
                onClick={() => onImageClick?.(index)}
                className={`${col} ${lgCol} ${height} group relative overflow-hidden bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer grayscale contrast-[1.1] hover:grayscale-0 hover:contrast-100 transition-[filter] duration-500`}
                aria-label={`View ${image.alternativeText ?? image.name}`}
              >
                <Image
                  src={`${strapiUrl}${image.url}`}
                  alt={image.alternativeText ?? image.name}
                  fill
                  priority={index === 0}
                  sizes={index === 0 ? "(max-width: 768px) 100vw, (max-width: 1024px) 67vw, 67vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[0.99]"
                />

                {/* Technical scan tag — appears on hover */}
                <span className="pointer-events-none absolute top-5 left-5 bg-black/70 text-primary/80 font-sans text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
