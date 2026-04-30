/**
 * Loading skeleton for the About page.
 * Automatically used by Next.js as a Suspense boundary
 * while the Server Component data fetch resolves.
 *
 * Mirrors the About page layout: title placeholder + varied-height
 * block placeholders representing Media, Quote, RichText, and Slider zones.
 */
export default function AboutLoading() {
  return (
    <div
      className="animate-pulse space-y-8"
      role="status"
      aria-label="Loading about page"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        {/* Title placeholder — matches font-display heading size */}
        <div className="h-12 w-3/4 rounded bg-surface/50 mb-8 md:mb-12" />

        {/* Varied-height block placeholders simulating dynamic zone blocks */}

        {/* Tall block — Media / Slider (aspect-video) */}
        <div className="aspect-video rounded-2xl bg-surface/50 mb-8" />

        {/* Medium block — Quote (border-left treatment visible) */}
        <div className="h-24 rounded-r-lg bg-surface/50 mb-8 border-l-4 border-surface/30 pl-6" />

        {/* Text-rich block — RichText (multiple lines) */}
        <div className="space-y-3 mb-8">
          <div className="h-8 w-1/2 rounded bg-surface/50" />
          <div className="h-4 w-full rounded bg-surface/50" />
          <div className="h-4 w-5/6 rounded bg-surface/50" />
          <div className="h-4 w-3/4 rounded bg-surface/50" />
        </div>

        {/* Another tall block — Slider / Media */}
        <div className="aspect-video rounded-2xl bg-surface/50" />
      </div>
    </div>
  );
}
