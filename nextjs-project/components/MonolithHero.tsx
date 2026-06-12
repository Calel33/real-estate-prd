import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/schemas/property";

interface MonolithHeroProps {
  tagline?: string;
  property?: Property | null;
  strapiUrl?: string;
  headline?: string;
  description?: string;
}

export function MonolithHero({
  tagline,
  property,
  strapiUrl,
  headline = "DISRUPT\nTHE BLOCK",
  description = "Real estate built for the century ahead. We pair premium properties with the infrastructure to bring assets on chain so land is as easy to trade as anything else.",
}: MonolithHeroProps) {
  const heroImageUrl =
    property?.heroImage?.url
      ? property.heroImage.url.startsWith("http")
        ? property.heroImage.url
        : strapiUrl
          ? `${strapiUrl}${property.heroImage.url}`
          : null
      : null;

  return (
    <div className="relative min-h-full w-full flex items-center justify-center">
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
        <div className="font-display text-2xl tracking-wide font-black text-primary">D</div>
        <div className="rotate-[-90deg] origin-center whitespace-nowrap text-[8px] tracking-[0.5em] uppercase text-white/20">
          Digital Estates
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-1 h-1 rounded-full bg-primary" />
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="w-1 h-1 rounded-full bg-white/20" />
        </div>
      </div>

      {/* Centered hero content */}
      <div className="relative z-10 text-center flex flex-col items-center px-6 py-24">
        {tagline && (
          <div className="animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.2s]">
            <span className="text-[10px] uppercase tracking-[0.5em] mb-6 block text-primary/70">
              {tagline}
            </span>
          </div>
        )}

        <h1 className="animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.4s] font-display text-[clamp(3.5rem,12vw,12rem)] leading-[0.85] tracking-[-0.03em] uppercase font-black text-primary">
            {headline.split("\n").map((line, i, arr) => (
              <span key={line}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
        </h1>

        <div className="mt-10 animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.6s] flex flex-col items-center gap-8">
          <p className="max-w-md text-xs tracking-[0.25em] leading-loose uppercase text-white/40">
            {description}
          </p>

          <Link
            href="/properties"
            className="group relative inline-flex items-center gap-3 px-10 py-4 overflow-hidden rounded-glass backdrop-blur-[2px] border border-primary/20 bg-primary/10 text-primary text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-700 hover:pl-14 hover:bg-primary hover:text-background"
          >
            <span className="relative z-10">
              Explore the Portfolio
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
