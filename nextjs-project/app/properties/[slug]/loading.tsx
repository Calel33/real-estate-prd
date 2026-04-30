/**
 * Loading skeleton for the property detail page.
 * Automatically used by Next.js as a Suspense boundary
 * while the Server Component data fetch resolves.
 */
export default function PropertyDetailLoading() {
  return (
    <div
      className="animate-pulse space-y-8"
      role="status"
      aria-label="Loading property details"
    >
      {/* Hero placeholder */}
      <div className="relative h-screen w-full bg-surface/50" />

      {/* Details placeholder */}
      <div className="mx-auto max-w-7xl px-6 py-16 space-y-4">
        <div className="h-12 w-96 rounded bg-surface/50" />
        <div className="h-6 w-64 rounded bg-surface/50" />
        <div className="flex gap-6 mt-6">
          <div className="h-16 w-24 rounded bg-surface/50" />
          <div className="h-16 w-24 rounded bg-surface/50" />
        </div>
        <div className="mt-8 space-y-3 pt-4">
          <div className="h-4 w-full rounded bg-surface/50" />
          <div className="h-4 w-3/4 rounded bg-surface/50" />
          <div className="h-4 w-1/2 rounded bg-surface/50" />
        </div>
      </div>

      {/* Gallery grid placeholder */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="h-10 w-48 rounded bg-surface/50 mb-8" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-2xl bg-surface/50"
            />
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="h-10 w-32 rounded bg-surface/50 mb-8" />
        <div className="aspect-[16/9] rounded-2xl bg-surface/50" />
      </div>
    </div>
  );
}
