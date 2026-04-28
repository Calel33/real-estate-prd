import Link from "next/link";

/**
 * CTA section displayed at the bottom of the homepage.
 * Encourages visitors to contact the agency about the featured property.
 */
export function CtaSection() {
  return (
    <section
      aria-label="Call to action"
      className="relative py-24 md:py-32"
    >
      {/* Glass gradient shell */}
      <div className="mx-4 rounded-glass-shell bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]">
        {/* Glass content surface */}
        <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass px-6 py-16 md:py-20 flex flex-col items-center text-center gap-6">
          <h2 className="font-display text-primary text-3xl md:text-5xl leading-tight">
            Interested in this property?
          </h2>
          <p className="text-secondary/70 text-lg md:text-xl max-w-lg font-sans">
            Get in touch with us to schedule a viewing or learn more about this
            exceptional offering.
          </p>
          <Link
            href="/contact"
            className="inline-flex mt-4 rounded-full bg-primary text-background font-sans text-sm md:text-base font-medium px-8 py-3 hover:bg-primary/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
