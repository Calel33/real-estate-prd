export function Navbar() {
  const links = [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Glass gradient shell */}
      <div className="mx-4 mt-4 rounded-[24px] bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]">
        {/* Glass content surface */}
        <div className="rounded-[23px] bg-surface/50 backdrop-blur-[4px] px-6 py-4 flex items-center justify-between"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px 0 rgba(255, 255, 255, 0.02) inset, 0 0 10px 0 rgba(255, 255, 255, 0.05) inset",
          }}
        >
          {/* Logo */}
          <span className="font-display text-primary text-lg">
            Zenith
          </span>

          {/* Desktop nav links */}
          <ul className="hidden md:flex gap-8" role="list">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-secondary/70 hover:text-primary transition-colors text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-secondary/70 hover:text-primary transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded="false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
