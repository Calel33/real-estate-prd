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
        <div className="font-display text-2xl tracking-wide font-black" style={{ color: '#F2EAD3' }}>D</div>
        <div className="rotate-[-90deg] origin-center whitespace-nowrap text-[8px] tracking-[0.5em] uppercase" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>
          Digital Estates
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#F2EAD3' }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
        </div>
      </div>

      {/* Centered hero content */}
      <div className="relative z-10 text-center flex flex-col items-center px-6 py-24">
        {tagline && (
          <div className="animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.2s]">
            <span className="text-[10px] uppercase tracking-[0.5em] mb-6 block" style={{ color: 'rgba(242, 234, 211, 0.7)' }}>
              {tagline}
            </span>
          </div>
        )}

        <h1 className="animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.4s] font-display text-[clamp(3.5rem,12vw,12rem)] leading-[0.85] tracking-[-0.03em] uppercase font-black" style={{ color: '#F2EAD3' }}>
            DISRUPT<br />THE BLOCK
        </h1>

        <div className="mt-10 animate-[slide-up_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards] opacity-0 [animation-delay:0.6s] flex flex-col items-center gap-8">
          <p className="max-w-md text-xs tracking-[0.25em] leading-loose uppercase" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
            Real estate built for the century ahead. We pair premium properties with the infrastructure to bring assets on chain so land is as easy to trade as anything else.
          </p>

          <Link
            href="/properties"
            className="group relative inline-flex items-center gap-3 px-10 py-4 overflow-hidden rounded-glass backdrop-blur-[2px] border text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-700 hover:pl-14 hover:text-background" style={{ backgroundColor: 'rgba(242, 234, 211, 0.1)', borderColor: 'rgba(242, 234, 211, 0.2)', color: '#F2EAD3' }}
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
