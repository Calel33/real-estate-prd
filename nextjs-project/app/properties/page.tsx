import type { Metadata } from "next";
import { intake } from "@/lib/intake";
import { getEnv } from "@/lib/env";
import { getGlobalMetadata } from "@/lib/metadata";
import { PropertyIndex } from "@/components/PropertyIndex";

/** Render at request time — Strapi may not be available during build. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const globalData = await getGlobalMetadata();

  return {
    title: `Properties — ${globalData.siteName}`,
    description:
      globalData.defaultSeo?.metaDescription ??
      `Browse our portfolio of exceptional properties.`,
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
 * Properties listing page — "The Index"
 *
 * Ported from the Zenith reference design:
 *   - Dark aesthetic with headline "THE INDEX"
 *   - Grid table layout: Ref | Property | Location | Type
 *   - Hover image reveal that follows the cursor
 *   - Footer with aggregate portfolio stats
 *
 * Data source: Strapi CMS via intake.properties()
 */
export default async function PropertiesPage() {
  const properties = await intake.properties();
  const strapiUrl = getEnv().STRAPI_URL;

  return <PropertyIndex properties={properties} strapiUrl={strapiUrl} />;
}
