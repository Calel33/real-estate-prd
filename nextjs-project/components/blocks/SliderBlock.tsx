import Image from "next/image";
import type { StrapiMedia } from "@/lib/schemas/strapi";

interface SliderBlockProps {
  /** Array of Strapi media files to display in the scrollable gallery. */
  files: StrapiMedia[];
  /** Base URL of the Strapi backend (e.g., http://localhost:1337). */
  strapiUrl: string;
}

/**
 * Renders a `shared.slider` block from Strapi's about dynamic zone.
 * Displays a horizontally scrollable gallery of images with CSS snap
 * points for smooth, touch-friendly swipe navigation on mobile.
 *
 * Gracefully renders nothing when `files` is empty or null/undefined.
 */
export function SliderBlock({ files, strapiUrl }: SliderBlockProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className="my-8">
      <div
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-glass"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {files.map((file) => (
          <div
            key={file.id}
            className="relative aspect-video flex-shrink-0 w-full overflow-hidden rounded-glass"
            style={{ scrollSnapAlign: "start", flexShrink: 0 }}
          >
            <Image
              src={`${strapiUrl}${file.url}`}
              alt={file.alternativeText ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
