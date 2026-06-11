import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchProperty } from "@/lib/fetch-property";
import { fetchGlobal } from "@/lib/fetch-global";
import { getEnv } from "@/lib/env";
import { StrapiBlocksRenderer } from "@/components/StrapiBlocksRenderer";
import { GalleryWithLightbox } from "@/components/GalleryWithLightbox";
import { HeroSection } from "@/components/HeroSection";

/** Render at request time — Strapi may not be available during build. */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [property, globalData] = await Promise.all([
    fetchProperty(slug),
    fetchGlobal(),
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
          images: [{ url: `${strapiUrl}${ogImage.url}` }],
        }
      : undefined,
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await fetchProperty(slug);

  if (!property) {
    notFound();
  }

  const strapiUrl = getEnv().STRAPI_URL;
  const { title, location, acreage, propertyType, description, gallery, mapImage, highlights, locationAccess } = property;

  return (
    <>
      {/* Hero Section */}
      <HeroSection property={property} strapiUrl={strapiUrl}>
        <h1 className="font-display text-5xl md:text-8xl text-primary leading-tight mt-2">
          {title}
        </h1>
        {location && (
          <p className="mt-4 text-secondary/70 text-lg md:text-xl font-sans">
            {location}
          </p>
        )}
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
              <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-primary/50 mb-6 block font-medium">
                Property_Overview
              </span>
              <div className="space-y-10">
                <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight uppercase tracking-tighter">
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
              <div className="bg-[#0c0c0c] p-8 md:p-10 border border-white/5">
                <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary/30 mb-10 block font-medium italic">
                  Technical_Highlights
                </span>
                <ul className="space-y-8">
                  {acreage && (
                    <li className="flex items-start gap-6">
                      <span className="font-sans text-[10px] text-primary/60 flex-shrink-0">
                        01
                      </span>
                      <div>
                        <p className="font-sans text-xs font-bold uppercase tracking-widest text-secondary/90 mb-1">
                          Land_Footprint
                        </p>
                        <p className="font-sans text-[10px] uppercase tracking-[0.05em] text-secondary/40 leading-loose">
                          {acreage} acres of prime terrain
                        </p>
                      </div>
                    </li>
                  )}
                  {propertyType && (
                    <li className="flex items-start gap-6">
                      <span className="font-sans text-[10px] text-primary/60 flex-shrink-0">
                        02
                      </span>
                      <div>
                        <p className="font-sans text-xs font-bold uppercase tracking-widest text-secondary/90 mb-1">
                          Classification
                        </p>
                        <p className="font-sans text-[10px] uppercase tracking-[0.05em] text-secondary/40 leading-loose capitalize">
                          {propertyType.replace("_", " ")} designation
                        </p>
                      </div>
                    </li>
                  )}
                  {location && (
                    <li className="flex items-start gap-6">
                      <span className="font-sans text-[10px] text-primary/60 flex-shrink-0">
                        {acreage && propertyType ? "03" : acreage || propertyType ? "02" : "01"}
                      </span>
                      <div>
                        <p className="font-sans text-xs font-bold uppercase tracking-widest text-secondary/90 mb-1">
                          Geographic_Context
                        </p>
                        <p className="font-sans text-[10px] uppercase tracking-[0.05em] text-secondary/40 leading-loose">
                          {location}
                        </p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Highlights & Location Access Cards */}
      {((highlights && highlights.length > 0) || (locationAccess && locationAccess.length > 0)) && (
        <section
          aria-label="Property highlights and location access"
          className="py-16 md:py-24"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Property Highlights Card */}
              {highlights && highlights.length > 0 && (
                <div className="bg-[#0c0c0c] p-8 md:p-10 border border-white/5">
                  <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary/30 mb-10 block font-medium italic">
                    Property_Highlights
                  </span>
                  <ul className="space-y-8">
                    {highlights.map((item, index) => (
                      <li key={`${item.label}-${index}`} className="flex items-start gap-6">
                        <span className="font-sans text-[10px] text-primary/60 flex-shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-sans text-xs font-bold uppercase tracking-widest text-secondary/90 mb-1">
                            {item.label.replace(/ /g, "_")}
                          </p>
                          <p className="font-sans text-[10px] uppercase tracking-[0.05em] text-secondary/40 leading-loose">
                            {item.value}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Location & Access Card */}
              {locationAccess && locationAccess.length > 0 && (
                <div className="bg-[#0c0c0c] p-8 md:p-10 border border-white/5">
                  <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-secondary/30 mb-10 block font-medium italic">
                    Location_&_Access
                  </span>
                  <ul className="space-y-8">
                    {locationAccess.map((item, index) => (
                      <li key={`${item.label}-${index}`} className="flex items-start gap-6">
                        <span className="font-sans text-[10px] text-primary/60 flex-shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="font-sans text-xs font-bold uppercase tracking-widest text-secondary/90 mb-1">
                            {item.label.replace(/ /g, "_")}
                          </p>
                          <p className="font-sans text-[10px] uppercase tracking-[0.05em] text-secondary/40 leading-loose">
                            {item.value}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Grid with Lightbox */}
      <GalleryWithLightbox images={gallery ?? []} strapiUrl={strapiUrl} />

      {/* Map Image */}
      {mapImage && (
        <section aria-label="Property map" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
              Location
            </h2>
            <div className="mt-12 relative aspect-[16/9] overflow-hidden rounded-2xl">
              <Image
                src={`${strapiUrl}${mapImage.url}`}
                alt={mapImage.alternativeText ?? `Map of ${title}`}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      <section
        aria-label="Contact call to action"
        className="relative py-24 md:py-32"
      >
        <div className="mx-4 rounded-glass-shell bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]">
          <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass px-6 py-16 md:py-20 flex flex-col items-center text-center gap-6">
            <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
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
