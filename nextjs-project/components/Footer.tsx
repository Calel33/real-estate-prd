/**
 * Footer component — renders CMS-driven footer content.
 * Currently uses placeholder text; will fetch from Strapi `GET /api/global?populate=*` in Slice 2.
 */
export function Footer() {
  // Placeholder: will be replaced with CMS data in Slice 2
  const footerText = "Disrupt the Block";
  const currentYear = new Date().getFullYear();

  return (
    <footer role="contentinfo" aria-label="Site footer" className="mt-auto">
      {/* Glass gradient shell */}
      <div className="mx-4 mb-4 rounded-glass-shell bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]">
        {/* Glass content surface */}
        <div className="rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-secondary/70 text-sm">
              &copy; {currentYear} {footerText}
            </p>
            <p className="text-secondary/50 text-xs">
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
