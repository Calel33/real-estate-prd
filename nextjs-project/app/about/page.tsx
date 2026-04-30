import type { Metadata } from "next";
import { fetchAbout } from "@/lib/fetch-about";
import { fetchGlobal } from "@/lib/fetch-global";
import { getEnv } from "@/lib/env";
import { DynamicZoneRenderer } from "@/components/DynamicZoneRenderer";

/** Render at request time — Strapi content may change frequently. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const globalData = await fetchGlobal();

  return {
    title:
      globalData.defaultSeo?.metaTitle ??
      `About — ${globalData.siteName}`,
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
 * About Page — async Server Component.
 * Fetches content from Strapi's `about` single type and renders
 * the page title plus dynamic zone blocks via DynamicZoneRenderer.
 *
 * When the About content has not been created in Strapi yet,
 * a placeholder message is shown instead of an error page.
 */
export default async function AboutPage() {
  const about = await fetchAbout();
  const { STRAPI_URL: strapiUrl } = getEnv();

  const hasContent = about.title !== null || about.blocks.length > 0;

  return (
    <main className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {about.title && (
          <h1 className="font-display text-primary text-4xl md:text-5xl lg:text-6xl leading-tight mb-8 md:mb-12">
            {about.title}
          </h1>
        )}

        {hasContent ? (
          <DynamicZoneRenderer blocks={about.blocks} strapiUrl={strapiUrl} />
        ) : (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-display text-2xl text-primary">
              No content yet
            </h2>
            <p className="max-w-md text-secondary/70">
              The About page has not been set up in the CMS. Create the
              &quot;About&quot; single type entry in the Strapi admin panel to
              populate this page.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
