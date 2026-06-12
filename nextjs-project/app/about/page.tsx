import type { Metadata } from "next";
import Link from "next/link";
import { intake } from "@/lib/intake";
import { getEnv } from "@/lib/env";
import { DynamicZoneRenderer } from "@/components/DynamicZoneRenderer";

/** Render at request time — Strapi content may change frequently. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const globalData = await intake.global();

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
 * About Page — Monolith-style brand presentation.
 *
 * Adapted from the "Zenith | Singular_Identity" reference design:
 *   - Square frame border with animated scanline (scrolls with content)
 *   - Corner accent badges on the frame
 *   - Large monolith display heading
 *   - Manifesto body text + stat grid
 *   - Background watermark
 *   - Strapi-driven content (title + dynamic zone blocks)
 *
 * Frame clears the fixed navbar (top-20 inset) and sits above the footer.
 */
export default async function AboutPage() {
  const about = await intake.about();
  const { STRAPI_URL: strapiUrl } = getEnv();

  const heading = about.title ?? "About Disrupt the Block";
  const hasBodyContent = about.blocks.length > 0;

  return (
    <section
      aria-label="About us"
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* ── Square frame — scrolls with content ── */}
      <div className="absolute inset-x-4 top-24 bottom-4 border border-primary/[0.08] pointer-events-none z-10" />

      {/* ── Scanline inside frame ── */}
      <div
        className="absolute left-4 right-4 top-24 bottom-4 pointer-events-none z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute left-0 w-full h-[2px] opacity-[0.06]"
          style={{
            backgroundColor: "var(--color-primary)",
            animation: "scanline 12s linear infinite",
          }}
        />
      </div>

      {/* ── Corner accents — data markers on the frame ── */}
      <div className="absolute top-[88px] left-6 z-20 pointer-events-none bg-background px-3 py-1">
        <span className="text-[9px] uppercase tracking-[0.3em] text-primary/40 font-sans font-black">
          Est. 2024
        </span>
      </div>
      <div className="absolute top-[88px] right-6 z-20 pointer-events-none text-right bg-background px-3 py-1">
        <span className="text-[9px] uppercase tracking-[0.3em] text-primary/40 font-sans font-black">
          DTB Belize
        </span>
      </div>

      {/* ── Background watermark ── */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        style={{ opacity: 0.015 }}
      >
        <span className="font-display text-[25vw] tracking-tighter text-primary">
          DTB
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-0 mx-auto max-w-7xl px-6 pt-40 pb-16 md:pt-52 md:pb-24">
        {/* Hero grid */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* ── Left: Label + Heading ── */}
          <div className="animate-slide-up animation-delay-100 opacity-0">
            <span className="text-[10px] uppercase tracking-[0.5em] text-primary/60 font-sans mb-6 block font-black">
              DTB_About
            </span>
            <h1
              aria-label={heading}
              className="font-display font-black text-[clamp(2.5rem,8vw,7rem)] leading-[0.85] tracking-[-0.03em] uppercase text-primary"
            >
              {heading.split(" ").map((word, i, arr) => (
                <span key={i}>
                  {word}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h1>
          </div>

          {/* ── Right: Body + Stats + CTA ── */}
          <div className="space-y-10 animate-slide-up animation-delay-300 opacity-0">
            {/* Manifesto body / content blocks */}
            <div className="font-sans text-xs leading-[2] uppercase tracking-[0.1em] text-secondary/50 max-w-lg">
              {hasBodyContent ? (
                <DynamicZoneRenderer
                  blocks={about.blocks}
                  strapiUrl={strapiUrl}
                />
              ) : (
                <>
                  <p className="mb-4">
                    Land is the oldest asset class on earth. It shouldn&apos;t
                    be the slowest. We believe physical properties should have
                    digital infrastructure. Physical and digital. Side by side.
                  </p>
                  <p>
                    Every asset we touch gets two things: the rigor of
                    old-world real estate and the architecture of what&apos;s
                    next. One without the other is half the picture. Together,
                    it&apos;s how an industry built on paper and patience
                    finally learns to move.
                  </p>
                </>
              )}
            </div>

            {/* ── Stat grid ── */}
            {/* Glass gradient shell */}
            <div className="rounded-glass-shell bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]">
              {/* Glass content surface */}
              <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass px-6 py-8">
                <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/50 font-sans mb-2 font-black">
                    Access
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest text-secondary/80 font-sans">
                    Physical + Digital
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-primary/50 font-sans mb-2 font-black">
                    Future State
                  </p>
                  <p className="text-xs font-black uppercase tracking-widest text-secondary/80 font-sans">
                    Held Today. Liquid Tomorrow.
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* ── CTA ── */}
            <Link
              href="/properties"
              className="group relative inline-flex items-center gap-3 px-10 py-4 overflow-hidden rounded-glass backdrop-blur-[2px] border border-primary/20 bg-primary/10 text-primary text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-700 hover:pl-14 hover:bg-primary hover:text-background"
            >
              <span className="relative z-10">Explore Portfolio</span>
              <span className="relative z-10 text-base transition-transform duration-700 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
