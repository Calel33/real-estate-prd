import type { Metadata } from "next";
import { fetchProperties } from "@/lib/fetch-property";
import { fetchGlobal } from "@/lib/fetch-global";
import { getEnv } from "@/lib/env";
import { HeroSection } from "@/components/HeroSection";
import { GalleryPreview } from "@/components/GalleryPreview";
import { CtaSection } from "@/components/CtaSection";

/** Render at request time — Strapi may not be available during build. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const globalData = await fetchGlobal();

  return {
    title: globalData.siteName,
    description:
      globalData.defaultSeo?.metaDescription ?? globalData.siteDescription,
    openGraph: globalData.defaultSeo?.shareImage
      ? {
          images: [
            {
              url: `${getEnv().STRAPI_URL}${globalData.defaultSeo.shareImage.url}`,
            },
          ],
        }
      : undefined,
  };
}

/**
 * Homepage — async Server Component.
 * Fetches the first published property from Strapi and renders
 * it as a fullscreen hero with gallery preview and CTA.
 */
export default async function Home() {
  const properties = await fetchProperties();
  const featured = properties[0] ?? null;

  if (!featured) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-display text-primary text-4xl md:text-6xl leading-tight">
          Welcome to Zenith
        </h1>
        <p className="text-secondary/70 text-lg font-sans max-w-lg">
          Our property portfolio is being updated. Check back soon for
          exceptional listings.
        </p>
      </div>
    );
  }

  const { STRAPI_URL: strapiUrl } = getEnv();
  const galleryImages = featured.gallery ?? [];

  return (
    <>
      <HeroSection property={featured} strapiUrl={strapiUrl} />

      <GalleryPreview images={galleryImages} strapiUrl={strapiUrl} />

      <CtaSection />
    </>
  );
}
