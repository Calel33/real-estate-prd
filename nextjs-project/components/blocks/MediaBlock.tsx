import Image from "next/image";
import type { StrapiMedia } from "@/lib/schemas/strapi";

interface MediaBlockProps {
  /** Strapi media file object. If null/undefined, nothing is rendered. */
  file: StrapiMedia;
  /** Base URL of the Strapi backend (e.g., http://localhost:1337) */
  strapiUrl: string;
}

/**
 * Renders a `shared.media` block from Strapi's about dynamic zone.
 * Displays a responsive image with glass treatment styling.
 *
 * Gracefully renders nothing when `file` is null/undefined.
 */
export function MediaBlock({ file, strapiUrl }: MediaBlockProps) {
  if (!file) return null;

  return (
    <figure className="my-8">
      <div className="relative aspect-video overflow-hidden rounded-glass">
        <Image
          src={`${strapiUrl}${file.url}`}
          alt={file.alternativeText ?? ""}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
      </div>
      {file.alternativeText && (
        <figcaption className="mt-4 text-center text-secondary/70 text-sm font-sans">
          {file.alternativeText}
        </figcaption>
      )}
    </figure>
  );
}
