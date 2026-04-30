import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchProperty } from "@/lib/fetch-property";
import { getEnv } from "@/lib/env";

/** Render at request time — Strapi may not be available during build. */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await fetchProperty(slug);

  if (!property) {
    return { title: "Property Not Found" };
  }

  const strapiUrl = getEnv().STRAPI_URL;

  return {
    title: `${property.title} — Zenith`,
    description: property.location
      ? `${property.title} in ${property.location}. ${property.acreage ?? ""} acres.`
      : `${property.title} — View property details.`,
    openGraph: property.heroImage
      ? {
          images: [{ url: `${strapiUrl}${property.heroImage.url}` }],
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
  const { title, location, acreage, propertyType, heroImage, heroVideo } = property;

  return (
    <>
      {/* Hero Section */}
      <section
        aria-label={`${title} hero`}
        className="relative h-screen w-full overflow-hidden"
      >
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

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Content overlay */}
        <div className="relative z-10 flex h-full flex-col justify-end pb-24 pl-8 md:pl-24">
          <h1 className="font-display text-5xl md:text-8xl text-secondary leading-tight mt-2">
            {title}
          </h1>
          {location && (
            <p className="mt-4 text-secondary/70 text-lg md:text-xl font-sans">
              {location}
            </p>
          )}
        </div>
      </section>

      {/* Property Details */}
      <section aria-label="Property details" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
            {title}
          </h2>
          {location && (
            <p className="mt-4 text-secondary/70 text-lg font-sans">
              {location}
            </p>
          )}
          {acreage && (
            <p className="mt-2 text-secondary/70 text-base font-sans">
              {acreage} acres
            </p>
          )}
          {propertyType && (
            <p className="mt-2 text-secondary/70 text-base font-sans">
              {propertyType}
            </p>
          )}
        </div>
      </section>

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
