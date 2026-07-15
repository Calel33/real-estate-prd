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
          poster={heroImage ? (heroImage.url.startsWith("http") ? heroImage.url : `${strapiUrl}${heroImage.url}`) : undefined}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={`/api/media?url=${encodeURIComponent(heroVideo.url)}`} type={heroVideo.mime} />
        </video>
      ) : heroImage ? (
        <Image
          src={heroImage.url.startsWith("http") ? heroImage.url : `${strapiUrl}${heroImage.url}`}
          alt={heroImage.alternativeText ?? title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}

      {/* Gradient overlay — strong for video readability, subtle for image legibility */}
      <div
        className={
          heroVideo
            ? "absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent"
            : "absolute inset-0 bg-gradient-to-t from-background/20 via-background/10 to-transparent"
        }
      />

      {/* Content overlay — always visible; text-shadow ensures legibility over video */}
      <div className={`relative z-10 flex h-full flex-col justify-end pb-24 pl-8 md:pl-24 ${heroVideo ? "[text-shadow:0_2px_8px_rgba(0,0,0,0.8)]" : ""}`}>
          {children ? (
            children
          ) : (
            <>
              <span className="font-sans font-black text-xs uppercase tracking-widest text-secondary/50">
                Featured Property
              </span>
              <h1 className="font-display font-black text-5xl md:text-8xl text-primary leading-tight mt-2">
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
