/**
 * Loading skeleton for the homepage.
 * Automatically used by Next.js as a Suspense boundary
 * while the Server Component data fetches resolve.
 */
export default function HomeLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Hero placeholder */}
      <div className="relative h-screen w-full bg-surface/50" />

      {/* Gallery grid placeholder */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-surface/50" />
          ))}
        </div>
      </div>
    </div>
  );
}
