"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/schemas/property";

// ── Types ───────────────────────────────────────────────────────────────────

interface PropertyIndexProps {
  properties: Property[];
  strapiUrl: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatRef(index: number): string {
  return String(index + 1).padStart(3, "0");
}

function formatPropertyType(type: string | null): string {
  if (!type) return "Property";
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Component ───────────────────────────────────────────────────────────────

export function PropertyIndex({ properties, strapiUrl }: PropertyIndexProps) {
  const [activeImageSrc, setActiveImageSrc] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isRevealVisible, setIsRevealVisible] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (overlayRef.current) {
      overlayRef.current.style.left = `${e.clientX}px`;
      overlayRef.current.style.top = `${e.clientY}px`;
    }
  };

  const handleRowEnter = (heroImageUrl: string | null) => {
    if (heroImageUrl) {
      setActiveImageSrc(`${strapiUrl}${heroImageUrl}`);
      setIsRevealVisible(true);
    }
  };

  const handleRowLeave = () => {
    setIsRevealVisible(false);
  };

  // ── Aggregate stats ───────────────────────────────────────────────────

  const totalAcreage = properties.reduce(
    (sum, p) => sum + (p.acreage ?? 0),
    0,
  );
  const distinctLocations = new Set(
    properties.map((p) => p.location).filter(Boolean),
  ).size;
  const hasProperties = properties.length > 0;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <header className="pt-36 pb-16 px-6 lg:px-20 relative z-10">
        <div className="font-sans text-[10px] tracking-[0.5em] text-primary/50 mb-6 uppercase flex items-center gap-4">
          <div className="w-12 h-px bg-primary/50" /> Portfolio_Holdings
        </div>
        <h1 className="font-display text-[clamp(3rem,12vw,10rem)] leading-[0.8] tracking-[-0.05em] font-black uppercase text-primary">
          THE
          <br />
          INDEX.
        </h1>
      </header>

      {/* Properties List */}
      <main
        className="px-6 lg:px-20 pb-40 relative"
        onMouseMove={handleMouseMove}
      >
        {/* Table Headers — hidden when no properties */}
        {hasProperties && (
          <div className="grid grid-cols-12 py-6 border-b border-white/10 font-sans text-[9px] uppercase tracking-[0.3em] text-secondary/30">
            <div className="col-span-1">Ref</div>
            <div className="col-span-5">Property</div>
            <div className="col-span-3">Location</div>
            <div className="col-span-3 text-right">Type</div>
          </div>
        )}

        {/* Empty state */}
        {!hasProperties && (
          <div className="py-32 text-center">
            <p className="font-display text-3xl md:text-5xl text-primary/30">
              No properties yet.
            </p>
            <p className="mt-4 font-sans text-sm text-secondary/40 uppercase tracking-widest">
              The portfolio is being curated — check back soon.
            </p>
          </div>
        )}

        {/* Property Rows */}
        {properties.map((property, index) => (
          <Link
            key={property.documentId}
            href={`/properties/${property.slug}`}
            className="index-row grid grid-cols-12 py-10 items-center border-b border-primary/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer relative z-10 hover:bg-primary/[0.03] hover:pl-5 hover:border-primary/40 group"
            onMouseEnter={() =>
              handleRowEnter(property.heroImage?.url ?? null)
            }
            onMouseLeave={handleRowLeave}
          >
            {/* Ref */}
            <div className="col-span-1 font-sans text-xs text-primary/50 font-bold">
              {formatRef(index)}
            </div>

            {/* Asset Identity */}
            <div className="col-span-5">
              <h2 className="text-2xl md:text-5xl font-display font-black uppercase tracking-tighter text-primary group-hover:text-primary transition-colors">
                {property.title}
              </h2>
              <p className="font-sans text-[9px] text-secondary/40 uppercase tracking-widest mt-1">
                {formatPropertyType(property.propertyType)}
                {property.acreage ? ` / ${property.acreage} acres` : ""}
              </p>
            </div>

            {/* Location */}
            <div className="col-span-3">
              <p className="font-sans text-xs uppercase tracking-widest text-secondary/60">
                {property.location ?? "—"}
              </p>
            </div>

            {/* Type */}
            <div className="col-span-3 text-right">
              <p className="text-xl font-bold tracking-tighter text-secondary/80">
                {property.propertyType
                  ? formatPropertyType(property.propertyType)
                  : "—"}
              </p>
            </div>
          </Link>
        ))}

        {/* Hover Image Reveal */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="fixed w-[250px] md:w-[400px] h-[300px] md:h-[500px] pointer-events-none z-20 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] grayscale contrast-125 hidden md:block"
          style={{
            opacity: isRevealVisible ? 0.6 : 0,
            transform: `translate(-50%, -50%) scale(${isRevealVisible ? 1 : 0.8})`,
          }}
        >
          {activeImageSrc && (
            <Image
              src={activeImageSrc}
              alt=""
              fill
              sizes="400px"
              className="object-cover"
            />
          )}
        </div>
      </main>

      {/* Footer Stats */}
      {hasProperties && (
        <footer
          role="contentinfo"
          className="fixed bottom-0 w-full bg-background border-t border-white/10 px-6 py-6 flex justify-between items-center z-[110]"
        >
          <div className="flex gap-10 md:gap-16">
            <div>
              <p className="font-sans text-[8px] text-secondary/30 uppercase mb-1 tracking-widest">
                Holdings
              </p>
              <p className="font-sans text-xs text-secondary font-bold">
                {properties.length}{" "}
                {properties.length === 1 ? "Property" : "Properties"}
              </p>
            </div>
            <div>
              <p className="font-sans text-[8px] text-secondary/30 uppercase mb-1 tracking-widest">
                Aggregate_Acreage
              </p>
              <p className="font-sans text-xs text-secondary font-bold">
                {totalAcreage.toLocaleString()}{" "}
                {totalAcreage === 1 ? "acre" : "acres"}
              </p>
            </div>
            <div>
              <p className="font-sans text-[8px] text-secondary/30 uppercase mb-1 tracking-widest">
                Locations
              </p>
              <p className="font-sans text-xs text-secondary font-bold">
                {distinctLocations}{" "}
                {distinctLocations === 1 ? "Location" : "Locations"}
              </p>
            </div>
          </div>
          <div className="hidden md:block text-[10px] font-sans text-secondary/20 uppercase tracking-[0.4em]">
            Zenith Holdings / Private Index
          </div>
        </footer>
      )}
    </>
  );
}
