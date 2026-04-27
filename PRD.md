# Real Estate Portfolio Website — PRD

## Problem Statement

I need a visually impactful, image-driven portfolio website to showcase real estate properties. I want full control over the frontend UI/UX, the ability to manage content through a CMS, and an architecture that scales from a single property launch to a multi-property portfolio. I need a contact mechanism so interested parties can reach me, and I want the site to look premium with a dark, glass-surface aesthetic.

## Solution

A modern real estate portfolio website built with Next.js (custom frontend) and Strapi (headless CMS), delivering a clean, image-driven experience with scalable content management. The frontend uses Server Components for data fetching, Framer Motion for animations, and a dark-mode-only design system. The backend runs Strapi v5 with PostgreSQL in production, providing REST APIs for all content.

## User Stories

1. As a site visitor, I want to see a fullscreen hero image or video when I land on the homepage, so that I immediately get a visual impression of the featured property.
2. As a site visitor, I want to see a preview gallery of property images on the homepage, so that I can browse multiple photos without navigating away.
3. As a site visitor, I want to click a "View Details" call-to-action, so that I can navigate to the full property detail page.
4. As a site visitor, I want to view a property detail page with a fullscreen hero, full image gallery, key property details (title, location, acreage, type), and a short description, so that I can learn everything about the property.
5. As a site visitor, I want to click images in the gallery to open a fullscreen lightbox with keyboard navigation and swipe support, so that I can examine property photos in detail.
6. As a site visitor, I want to see a static map image showing the property's location, so that I understand where the property is situated.
7. As a site visitor, I want to navigate between Home, Properties, About, and Contact pages via a persistent navigation bar, so that I can explore the site freely.
8. As a site visitor, I want to read a short personal introduction on the About page, so that I learn who is behind the portfolio.
9. As a site visitor, I want to fill out a contact form with my name, email, and message, so that I can send an inquiry about a property.
10. As a site visitor, I want to see inline validation errors on the contact form, so that I know what I need to correct before submitting.
11. As a site visitor, I want to see a success confirmation after submitting the contact form, so that I know my inquiry was received.
12. As a site visitor, I want the site to be fully responsive on mobile, tablet, and desktop, so that I can browse on any device.
13. As a site visitor, I want the site to load quickly with optimized images, so that I don't wait for heavy media to download.
14. As a site visitor, I want to see proper page titles and Open Graph metadata when I share property pages, so that shared links look professional.
15. As an admin, I want to log into a Strapi CMS admin panel, so that I can manage all site content.
16. As an admin, I want to create, edit, and publish property entries with a title, slug, location, acreage, property type, description, hero image, optional hero video, gallery images, optional map image, and status, so that I can fully control property content.
17. As an admin, I want to set a property's status to "draft" or "published", so that I can control which properties appear on the live site.
18. As an admin, I want to edit the About page content in the CMS, so that I can update my personal introduction without code changes.
19. As an admin, I want to configure site-wide settings (site name, description, footer text, social links, default SEO metadata) in the CMS, so that I can manage branding centrally.
20. As an admin, I want to view contact form submissions in the Strapi admin, so that I have a searchable record of all inquiries.
21. As an admin, I want to receive an email notification when someone submits the contact form, so that I can respond to inquiries promptly.
22. As an admin, I want the homepage to automatically update when I publish a new property or change content, so that the site reflects the latest data without a manual redeploy.
23. As a developer, I want the site to use dynamic `/properties/[slug]` routes from day one, so that adding a second property requires zero routing changes.
24. As a developer, I want the frontend to fetch data directly in Server Components via REST, so that the architecture is lean and idiomatic.
25. As a developer, I want the contact form submission to be validated with Zod on both client and server, so that invalid data never reaches the backend.
26. As a developer, I want the Strapi API to be accessed via an API token, so that only authorized requests can write submissions.
27. As a developer, I want content to be cached with hourly revalidation and on-demand revalidation via Strapi webhook, so that the site is fast but stays fresh.
28. As a developer, I want all API response types validated with Zod schemas, so that Strapi schema changes are caught at runtime.
29. As a developer, I want the design system tokens (colors, typography, spacing, radii, shadows) defined in Tailwind v4 `@theme inline`, so that all styling uses semantic design tokens.
30. As a developer, I want loading skeletons and error boundaries on every route, so that users see meaningful states during data fetches and failures.

## Implementation Decisions

### Architecture
- **Frontend**: Next.js 16 with App Router, Server Components by default, React 19
- **Backend**: Strapi v5.43.0 self-hosted, REST API (no GraphQL plugin)
- **Deployment**: Vercel (Next.js) + Railway (Strapi + PostgreSQL)

### Routing
- `/` — Homepage (property-as-hero, gallery preview, CTA)
- `/properties` — Property listing page (future multi-property grid)
- `/properties/[slug]` — Property detail page (hero, gallery, map, contact CTA)
- `/about` — About page
- `/contact` — Contact page with form
- `/api/contact` — Route handler for form submission (POST)
- `/api/revalidate` — Route handler for on-demand revalidation (POST, secret-protected)

### Strapi Schema Changes

**New: `property` (Collection Type)**
- `title` (string, required)
- `slug` (UID, targetField: title)
- `location` (string)
- `acreage` (number/float)
- `propertyType` (string or enumeration)
- `description` (rich text)
- `heroImage` (media, single, required)
- `heroVideo` (media, single, optional)
- `gallery` (media, multiple, optional)
- `mapImage` (media, single, optional)
- `status` (enumeration: draft, published)

**New: `submission` (Collection Type)**
- `name` (string, required)
- `email` (email, required)
- `message` (text, required)
- `submittedAt` (datetime, auto-set)

**Extended: `global` (Single Type)**
- `footerText` (string, optional)
- `socialLinks` (component, repeatable: { platform, url })
- `contactEmail` (string, optional)
- `contactPhone` (string, optional)
- Existing fields retained: `siteName`, `favicon`, `siteDescription`, `defaultSeo`

**Extended: `about` (Single Type)**
- No schema changes needed — existing `title` + `blocks` (dynamic zone) is sufficient

**Retained (unchanged):** `article`, `author`, `category` — kept for future blog use

### API Contracts
- `GET /api/properties?populate=*&filters[status][$eq]=published` — Fetch published properties
- `GET /api/properties?populate=*&filters[slug][$eq]={slug}&status=published` — Fetch single property
- `GET /api/about?populate=*` — Fetch about content
- `GET /api/global?populate=*` — Fetch global settings
- `POST /api/submissions` — Create submission (requires API token in Authorization header)
- `POST /api/revalidate?secret={REVALIDATE_SECRET}&path={path}` — Trigger Next.js revalidation

### Next.js Data Layer
- Zod schemas for every API response shape (`PropertySchema`, `SubmissionSchema`, `AboutSchema`, `GlobalSchema`)
- Fetch functions: `fetchProperty(slug)`, `fetchProperties()`, `fetchAbout()`, `fetchGlobal()`
- All fetches use `next/revalidate` for time-based caching
- `remotePatterns` in `next.config.ts` for Strapi media URLs

### Contact Form
- Client-side: HTML5 validation + React state for inline errors
- Server-side: Zod schema validation in route handler
- Route handler flow: validate → POST to Strapi `/api/submissions` → send email via Resend → return success
- Strapi auth via `STRAPI_API_TOKEN` in Authorization header

### Revalidation
- Time-based: `revalidate: 3600` (hourly) on all data fetches
- On-demand: Strapi webhook calls `/api/revalidate` on property publish/unpublish
- Secret-based authentication for revalidation endpoint

### Design System
- Dark mode only — no toggle, no light mode
- Fonts: Playfair Display (display), Inter (body/UI) — loaded via `next/font/google`
- Colors: `--color-primary: #F2EAD3`, `--color-secondary: #FFFFFF`, `--color-tertiary: #E9F6D9`, `--color-surface: #171717`, `--color-background: #0a0a0a`
- Spacing: 8px base rhythm (1px, 8px, 14px, 24px, 32px, 40px)
- Radii: 23px, 24px, 9999px
- Surfaces: Glass treatment with gradient borders, subtle shadows
- Motion: Framer Motion for scroll reveals, staggered text, hover transitions (300ms–1000ms)

### Image Handling
- Strapi Media Library stores all images locally (Railway persistent volume)
- Next.js `<Image>` with `remotePatterns` for optimization (WebP/AVIF conversion, caching)
- Hero video: `<video>` element with `muted`, `autoplay`, `loop`, `playsInline`, image fallback

### Map
- Static map image (Google Static Maps or Mapbox Static) stored as media in Strapi
- No JavaScript map library, no API key required for interactive maps

### Environment Variables
**Next.js:**
- `STRAPI_URL` — Strapi base URL
- `STRAPI_API_TOKEN` — Server-only token for write operations
- `RESEND_API_KEY` — Resend email API key
- `REVALIDATE_SECRET` — Shared secret for on-demand revalidation
- `RESEND_FROM_EMAIL` — Sender email for contact notifications

**Strapi:**
- `DATABASE_URL` — PostgreSQL connection string
- `DATABASE_CLIENT=postgres`
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`
- `JWT_SECRET`

### Loading & Error States
- `loading.tsx` per route segment — skeleton matching layout structure
- `error.tsx` per route segment — error message with retry button

### SEO
- `generateMetadata()` in each route using property/global fields
- Default metadata from `global.defaultSeo`
- Per-property: title, description, hero image as OG image

## Testing Decisions

### What makes a good test
- Tests external behavior, not implementation details
- Tests should pass through the public interface (HTTP endpoints, function inputs/outputs)
- Mock external dependencies (Strapi API, Resend) at the boundary, not internally

### Modules to test

**1. Data Layer (Module #5)**
- Zod schema validation: valid property data passes, missing required fields fail, wrong types fail
- `fetchProperty(slug)`: returns parsed property on success, throws on Strapi error, throws on validation failure
- `fetchProperties()`: returns array of published properties
- `fetchAbout()`: returns parsed about content
- `fetchGlobal()`: returns parsed global settings
- Prior art: None in codebase yet — these will be the first tests, establishing the pattern

**2. Contact Form Handler (Module #6)**
- `POST /api/contact` with valid data: creates Strapi submission, sends Resend email, returns 200
- `POST /api/contact` with invalid email: returns 400 with error message
- `POST /api/contact` with missing fields: returns 400 with field-specific errors
- `POST /api/contact` when Strapi is down: returns 502 with error message
- `POST /api/contact` when Resend fails: returns 500 with error message
- Prior art: None in codebase yet

**3. Revalidation Webhook (Module #4)**
- `POST /api/revalidate` with correct secret + path: calls `revalidatePath`, returns 200
- `POST /api/revalidate` with wrong secret: returns 401
- `POST /api/revalidate` without secret: returns 401
- `POST /api/revalidate` with missing path: returns 400
- Prior art: None in codebase yet

### Test tooling
- **Vitest** for data layer unit tests (Zod schemas, fetch functions)
- **Next.js test utilities** for route handler integration tests (mock fetch for Strapi/Resend)
- Tests live in `nextjs-project/src/__tests__/` (or co-located `*.test.ts` files)

## Out of Scope

- Advanced property filtering or search functionality
- User accounts or authentication for site visitors
- Marketplace or transaction features
- Booking or scheduling systems
- Blog functionality (article/author/category content types exist but are not wired into the frontend)
- Multi-language / i18n support
- Light mode theme
- Interactive map (Leaflet, Google Maps JS API)
- CDN for media storage (uploads stay on Railway filesystem)
- Analytics or tracking integration
- Newsletter signup

## Further Notes

- The project launches with **one published property**. The homepage hero IS that property. When multiple properties exist, the homepage can shift to a portfolio-level hero with a featured grid.
- The "Properties" nav link appears from launch, linking to the single published property's detail page.
- Strapi's existing `shared.seo` component is already defined and used by `global.defaultSeo`. This can be leveraged for default SEO metadata.
- The `about` single type uses a dynamic zone (`shared.media`, `shared.quote`, `shared.rich-text`, `shared.slider`). The frontend needs a block renderer to handle these component types.
- Dark mode is the only mode. The design system's glass surfaces, #F2EAD3 accent, and "Quiet Expanse" aesthetic are built for dark. No light mode toggle.
- PostgreSQL is used in production. The Strapi `config/database.ts` already supports postgres — just set `DATABASE_CLIENT=postgres` and `DATABASE_URL` in production env.
- The revalidation webhook requires a Strapi lifecycle hook or webhook configuration to call the Next.js endpoint on publish. This is a Strapi admin configuration, not code.
