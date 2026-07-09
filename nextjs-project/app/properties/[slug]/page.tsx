import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { intake } from "@/lib/intake";
import { getEnv } from "@/lib/env";
import { getGlobalMetadata } from "@/lib/metadata";
import { StrapiBlocksRenderer } from "@/components/StrapiBlocksRenderer";
import { GalleryWithLightbox } from "@/components/GalleryWithLightbox";
import { HeroSection } from "@/components/HeroSection";
import { DevelopmentComingSoon } from "@/components/DevelopmentComingSoon";

/** Render at request time — Strapi may not be available during build. */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [property, globalData] = await Promise.all([
    intake.property(slug),
    getGlobalMetadata(),
  ]);

  if (!property) {
    return { title: "Property Not Found" };
  }

  const strapiUrl = getEnv().STRAPI_URL;

  const ogImage = property.heroImage ?? globalData.defaultSeo?.shareImage;

  return {
    title: `${property.title} — ${globalData.siteName}`,
    description: property.location
      ? `${property.title} in ${property.location}. ${property.acreage ?? ""} acres.`
      : `${property.title} — View property details.`,
    openGraph: ogImage
      ? {
          images: [{ url: ogImage.url.startsWith("http") ? ogImage.url : `${strapiUrl}${ogImage.url}` }],
        }
      : undefined,
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await intake.property(slug);

  if (!property) {
    notFound();
  }

  const strapiUrl = getEnv().STRAPI_URL;
  const { title, location, acreage, propertyType, description, gallery, map, mapImage } = property;
  const mapCoordinates = map?.geometry?.coordinates;
  const mapLongitude = mapCoordinates?.[0];
  const mapLatitude = mapCoordinates?.[1];
  const hasMapCoordinates =
    typeof mapLongitude === "number" && typeof mapLatitude === "number";
  const mapLocation =
    slug === "emri-village" ? "Emri Village, Belize" : location;
  const mapQuery = hasMapCoordinates
    ? `${mapLatitude},${mapLongitude}`
    : mapLocation;
  const geographicContext =
    slug === "emri-village"
      ? "Utility-ready parcel with direct highway access, just 20 minutes from Belmopan."
      : location;
  const geographicContextList =
    slug === "emri-village"
      ? ["Utility-ready parcel", "Direct highway access", "Just 20 minutes from Belmopan"]
      : null;

  return (
    <>
      {/* Hero Section */}
      <HeroSection property={property} strapiUrl={strapiUrl}>
        <></>
      </HeroSection>

      {/* Property Description — Monolith layout (ported from Emri Village reference) */}
      <section
        aria-label="Property details"
        className="py-16 md:py-24 border-t border-white/5"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left: Description */}
            <div className="lg:col-span-7">
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-primary/50 mb-6 block font-black">
                Property_Overview
              </span>
              <div className="space-y-10">
                <h2 className="font-display font-black text-primary text-3xl md:text-5xl leading-tight uppercase tracking-tighter">
                  {title}
                </h2>
                {location && (
                  <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-secondary/30 italic">
                    {location}
                  </p>
                )}
                <div className="text-secondary/70 text-lg leading-relaxed">
                  <StrapiBlocksRenderer blocks={description} />
                </div>
              </div>
            </div>

            {/* Right: Technical Highlights */}
            <div className="lg:col-span-5">
              <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass p-8 md:p-10">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary/30 mb-10 block font-black italic">
                  Technical_Highlights
                </span>
                <ul className="space-y-8">
                  {(() => {
                    const highlights: Array<{
                      label: string;
                      content: import("react").ReactNode;
                      contentClassName?: string;
                    }> = [];

                    if (acreage != null) {
                      highlights.push({
                        label: "Land_Footprint",
                        content: `${acreage} ${acreage === 1 ? "acre" : "acres"} of prime terrain`,
                      });
                    }
                    if (propertyType) {
                      highlights.push({
                        label: "Classification",
                        content: `${propertyType.replace(/_/g, " ")} designation`,
                        contentClassName: "capitalize",
                      });
                    }
                    if (location) {
                      highlights.push({
                        label: "Geographic_Context",
                        content: geographicContextList ? (
                          <ul className="list-disc pl-4 space-y-1">
                            {geographicContextList.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          geographicContext
                        ),
                      });
                    }

                    return highlights.map((item, i) => (
                      <li key={item.label} className="flex items-start gap-6">
                        <span className="font-sans text-[10px] text-primary/60 flex-shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-sans text-xs font-black uppercase tracking-widest text-secondary/90 mb-1">
                            {item.label}
                          </p>
                          {item.label === "Geographic_Context" ? (
                            <div className="font-sans text-[10px] uppercase tracking-[0.05em] text-secondary/40 leading-loose">
                              {item.content}
                            </div>
                          ) : (
                            <p
                              className={`font-sans text-[10px] uppercase tracking-[0.05em] text-secondary/40 leading-loose ${item.contentClassName ?? ""}`}
                            >
                              {item.content}
                            </p>
                          )}
                        </div>
                      </li>
                    ));
                  })()}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Location Map */}
      {(mapQuery || mapImage) && (
        <section aria-label="Property map" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display font-black text-primary text-3xl md:text-5xl leading-tight">
              Location
            </h2>
            <div className="mt-12 mx-auto w-full max-w-4xl relative aspect-[3/2] overflow-hidden rounded-2xl border border-white/10 bg-surface/40 shadow-glass">
              {mapQuery ? (
                <iframe
                  title={`Map of ${title}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : mapImage ? (
                <Image
                  src={mapImage.url.startsWith("http") ? mapImage.url : `${strapiUrl}${mapImage.url}`}
                  alt={mapImage.alternativeText ?? `Map of ${title}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover"
                />
              ) : null}
            </div>
            {map?.place_name && (
              <p className="mt-6 text-center font-sans text-xs uppercase tracking-[0.15em] text-secondary/40">
                {map.place_name}
              </p>
            )}
          </div>
        </section>
      )}

      {slug === "emri-village" && <DevelopmentComingSoon />}

      {/* Gallery Grid with Lightbox */}
      <GalleryWithLightbox images={gallery ?? []} strapiUrl={strapiUrl} />

      {/* Contact CTA */}
      <section
        aria-label="Contact call to action"
        className="relative py-24 md:py-32"
      >
        <div className="mx-4 rounded-glass-shell bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]">
          <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass px-6 py-16 md:py-20 flex flex-col items-center text-center gap-6">
            <h2 className="font-display font-black text-primary text-3xl md:text-5xl leading-tight">
              Interested in this property?
            </h2>
            <p className="text-secondary/70 text-lg md:text-xl max-w-lg font-sans">
              Get in touch with us to schedule a viewing or learn more about this
              exceptional offering.
            </p>
            <Link
              href="/contact"
              className="inline-flex mt-4 rounded-full bg-primary text-background font-sans text-sm md:text-base font-medium px-8 py-3 hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
