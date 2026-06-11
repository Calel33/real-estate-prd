import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/schemas/property";

interface MonolithHeroProps {
  tagline?: string;
  property?: Property | null;
  strapiUrl?: string;
}

export function MonolithHero({ tagline, property, strapiUrl }: MonolithHeroProps) {
  const heroImageUrl =
    property?.heroImage && strapiUrl
      ? `${strapiUrl}${property.heroImage.url}`
      : null;

  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      {heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt={property?.heroImage?.alternativeText ?? ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-background" />
      )}

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20 backdrop-blur-[2px]" />

      {/* Side brand mark */}
      <div className="absolute left-0 top-0 h-full w-20 hidden lg:flex flex-col items-center justify-between py-16 z-20">
        <div className="font-display text-primary text-2xl tracking-wide">Z</div>
        <div className="rotate-[-90deg] origin-center whitespace-nowrap text-[8px] tracking-[0.5em] uppercase text-secondary/20">
          Curated Estates
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-1 h-1 bg-primary rounded-full" />
          <div className="w-1 h-1 bg-secondary/20 rounded-full" />
          <div className="w-1 h-1 bg-secondary/20 rounded-full" />
        </div>
      </div>

      {/* Centered hero content */}
      <div className="relative z-10 text-center flex flex-col items-center px-6">
        {tagline && (
          <div className="animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.2s]">
            <span className="text-[10px] uppercase tracking-[0.5em] text-primary/70 mb-6 block">
              {tagline}
            </span>
          </div>
        )}

        <h1 className="animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.4s] font-display text-[clamp(3.5rem,12vw,12rem)] leading-[0.85] tracking-[-0.03em] text-primary uppercase">
            Zenith<br />Estates
        </h1>

        <div className="mt-10 animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.6s] flex flex-col items-center gap-8">
          <p className="max-w-md text-xs tracking-[0.25em] leading-loose uppercase text-secondary/40">
            Exceptional properties curated for the discerning investor. Discover our portfolio of premium real estate.
          </p>

          <Link
            href="/properties"
            className="group relative inline-flex items-center gap-3 px-10 py-4 overflow-hidden rounded-glass bg-primary/10 backdrop-blur-[2px] border border-primary/20 text-primary text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-700 hover:pl-14 hover:bg-primary hover:text-background"
          >
            <span className="relative z-10">
              Access Portfolio
            </span>
            <span className="relative z-10 text-base transition-transform duration-700 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
