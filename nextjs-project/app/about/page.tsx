import { fetchAbout } from "@/lib/fetch-about";
import { getEnv } from "@/lib/env";
import { DynamicZoneRenderer } from "@/components/DynamicZoneRenderer";

/** Render at request time — Strapi content may change frequently. */
export const dynamic = "force-dynamic";

/**
 * About Page — async Server Component.
 * Fetches content from Strapi's `about` single type and renders
 * the page title plus dynamic zone blocks via DynamicZoneRenderer.
 */
export default async function AboutPage() {
  const about = await fetchAbout();
  const { STRAPI_URL: strapiUrl } = getEnv();

  return (
    <main className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {about.title && (
          <h1 className="font-display text-primary text-4xl md:text-5xl lg:text-6xl leading-tight mb-8 md:mb-12">
            {about.title}
          </h1>
        )}

        <DynamicZoneRenderer blocks={about.blocks} strapiUrl={strapiUrl} />
      </div>
    </main>
  );
}
