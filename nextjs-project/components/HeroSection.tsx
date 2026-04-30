import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Property } from "@/lib/schemas/property";

interface HeroSectionProps {
  property: Property;
  strapiUrl: string;
  /** Optional custom overlay content. When provided, replaces the default Featured Property overlay. */
  children?: ReactNode;
}

/**
 * Fullscreen hero section for the homepage.
 * Renders property hero image or video as background,
 * with gradient overlay and property info.
 */
export function HeroSection({ property, strapiUrl, children }: HeroSectionProps) {
  const { title, slug, location, heroImage, heroVideo } = property;

  return (
    <section
      aria-label="Featured property"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background media */}
      {heroVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={heroImage ? `${strapiUrl}${heroImage.url}` : undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={`${strapiUrl}${heroVideo.url}`} type={heroVideo.mime} />
        </video>
      ) : heroImage ? (
        <Image
          src={`${strapiUrl}${heroImage.url}`}
          alt={heroImage.alternativeText ?? title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}

      {/* Gradient overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-24 pl-8 md:pl-24">
        {children ? (
          children
        ) : (
          <>
            <span className="font-sans text-xs uppercase tracking-widest text-secondary/50">
              Featured Property
            </span>
            <h1 className="font-display text-5xl md:text-8xl text-secondary leading-tight mt-2">
              {title}
            </h1>
            {location && (
              <p className="mt-4 text-secondary/70 text-lg md:text-xl font-sans">
                {location}
              </p>
            )}
            <Link
              href={`/properties/${slug}`}
              className="mt-8 inline-flex items-center rounded-full bg-primary text-background font-sans text-sm md:text-base font-medium px-8 py-3 hover:bg-primary/90 transition-colors w-fit"
            >
              View Details
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
