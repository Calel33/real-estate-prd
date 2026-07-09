import type { Metadata } from "next";
import { getEnv } from "@/lib/env";
import { getGlobalMetadata } from "@/lib/metadata";
import { MonolithHero } from "@/components/MonolithHero";

/** Render at request time — Strapi may not be available during build. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const globalData = await getGlobalMetadata();

  return {
    title: globalData.siteName,
    description:
      globalData.defaultSeo?.metaDescription ??
      globalData.siteDescription ??
      "Disrupt the Block pairs exceptional properties with blockchain infrastructure. Explore our portfolio of premium real estate, built for the next era of ownership.",
    openGraph: globalData.defaultSeo?.shareImage
      ? {
          images: [
            {
              url: globalData.defaultSeo.shareImage.url.startsWith("http")
                ? globalData.defaultSeo.shareImage.url
                : `${getEnv().STRAPI_URL}${globalData.defaultSeo.shareImage.url}`,
            },
          ],
        }
      : undefined,
  };
}

/**
 * Homepage — brand splash / enter page.
 *
 * Adapted from the "Monolith" reference design:
 *   - Fullscreen hero with glass overlay
 *   - Animated centered content (tagline → headline → description → CTA)
 *   - Side brand mark
 *
 * Pure brand presentation. No property data.
 */
export default async function Home() {
  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-auto">
      <MonolithHero tagline="Real Assets. Digital Future." />
    </div>
  );
}
