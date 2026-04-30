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
  const { title, location, acreage, propertyType, description, gallery, mapImage } = property;

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

      {/* Property Details */}
      <section aria-label="Property details" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
                {title}
              </h2>
              {location && (
                <p className="mt-4 text-secondary/70 text-lg font-sans">
                  {location}
                </p>
              )}

              {/* Property stats */}
              <div className="mt-6 flex flex-wrap gap-6">
                {acreage && (
                  <div className="flex flex-col">
                    <span className="font-sans text-xs uppercase tracking-widest text-secondary/50">
                      Acreage
                    </span>
                    <span className="font-display text-primary text-2xl mt-1">
                      {acreage}
                    </span>
                  </div>
                )}
                {propertyType && (
                  <div className="flex flex-col">
                    <span className="font-sans text-xs uppercase tracking-widest text-secondary/50">
                      Type
                    </span>
                    <span className="font-display text-primary text-2xl mt-1 capitalize">
                      {propertyType}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-8">
                <StrapiBlocksRenderer blocks={description} />
              </div>
            </div>
          </div>
        </div>
      </section>

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
