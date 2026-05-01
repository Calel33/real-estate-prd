/**
 * Loading skeleton for the properties listing page.
 * Automatically used by Next.js as a Suspense boundary
 * while the Server Component data fetches resolve.
 */
export default function PropertiesLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <header className="pt-36 pb-16 px-6 lg:px-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-px bg-surface/40" />
          <div className="h-3 w-40 bg-surface/40 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-[clamp(3rem,12vw,10rem)] w-48 md:w-80 bg-surface/40 rounded" />
        </div>
      </header>

      {/* Table skeleton */}
      <div className="px-6 lg:px-20 pb-40">
        {/* Header row */}
        <div className="grid grid-cols-12 py-6 border-b border-white/10">
          {[1, 5, 3, 3].map((span, i) => (
            <div
              key={i}
              className="h-3 bg-surface/40 rounded"
              style={{ gridColumn: `span ${span}` }}
            />
          ))}
        </div>

        {/* Property row placeholders */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 py-10 items-center border-b border-white/[0.03]"
          >
            <div className="col-span-1">
              <div className="h-4 w-8 bg-surface/40 rounded" />
            </div>
            <div className="col-span-5 space-y-2">
              <div className="h-8 md:h-12 w-40 md:w-64 bg-surface/40 rounded" />
              <div className="h-3 w-32 bg-surface/40 rounded" />
            </div>
            <div className="col-span-3">
              <div className="h-4 w-24 bg-surface/40 rounded" />
            </div>
            <div className="col-span-3 flex justify-end">
              <div className="h-6 w-16 bg-surface/40 rounded" />
            </div>
          </div>
        ))}

        {/* Footer skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-white/10 px-6 py-6">
          <div className="flex gap-10 md:gap-16">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-2 w-16 bg-surface/40 rounded" />
                <div className="h-3 w-12 bg-surface/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
