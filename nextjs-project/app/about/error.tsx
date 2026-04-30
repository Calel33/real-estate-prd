"use client";

/**
 * Error boundary for the About page route.
 * Automatically used by Next.js when the Server Component throws.
 * Must be a Client Component to handle the reset() interaction.
 */
export default function AboutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <h2 className="font-display text-4xl text-primary">
        Something went wrong
      </h2>
      <p className="max-w-md text-secondary/70">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-primary px-8 py-3 text-background font-sans text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
