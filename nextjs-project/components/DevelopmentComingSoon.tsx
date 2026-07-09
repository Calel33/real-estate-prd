import Link from "next/link";

export function DevelopmentComingSoon() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-glass-shell bg-gradient-to-r from-primary/20 via-white/5 to-transparent p-[1px]">
          <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass px-8 py-8 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background border border-white/10 shadow-glass shrink-0">
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-black uppercase tracking-[0.2em] text-primary mb-1">
                  Emri Village — Private Preview
                </h3>
                <p className="font-sans text-[10px] uppercase tracking-[0.05em] leading-loose text-secondary/40">
                  Premium lots within Emri Village, developed to a new standard. Availability is limited — join the waitlist for priority access.
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 font-sans text-[10px] font-medium uppercase tracking-widest text-secondary hover:bg-primary hover:text-background transition-colors duration-500"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
