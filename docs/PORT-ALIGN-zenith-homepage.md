# PORT + ALIGN ANALYSIS

## Zenith Editorial Homepage → Our Real-Estate Project

**Source:** `file:///C:/Users/user1/Desktop/designs-ui/zenith-full-home.html`
**Target branch:** `ui-test`
**Date:** 2026-04-29
**Status:** Approved — issues created (#11–#16)

---

## 1. Original Intent

The Zenith editorial design treats architecture photography as editorial content — a magazine-style presentation of properties as curated "masterpieces" rather than standard listings. It provides:

1. **Dramatic editorial hero** — oversized serif typography, asymmetric grid, tall architectural photography with label
2. **Staggered image feature** — small+large image pair with descriptive editorial copy
3. **Brand pull quote** — centered quotation reinforcing curation philosophy
4. **Interactive property index** — cursor-tracking image preview on hover over property list items
5. **Scroll-choreographed reveals** — text clip animations and image mask reveals triggered by scroll position

The design philosophy is: *"We don't sell real estate. We curate environments that shape how you experience time."*

---

## 2. Required Capabilities

| Capability | Source Implementation | Our Implementation |
|---|---|---|
| Fullscreen editorial hero | Vanilla HTML grid, static images | React Server Component, Strapi heroImage/Video |
| Scroll-reveal animations | IntersectionObserver + CSS transitions | React `useEffect` + IntersectionObserver + CSS classes |
| Cursor-tracking image preview | Vanilla JS mousemove + fixed div | React `useRef` + `onMouseMove` + state |
| Property list with hover preview | Hardcoded `<a>` tags with `data-img` | Map over `Property[]` from Strapi |
| Film grain overlay | CSS `:after` pseudo-element on body | Component-level overlay div |
| Staggered animation delays | CSS `.delay-1/.delay-2/.delay-3` | Inline `transitionDelay` styles |

---

## 3. System Mismatches

| Issue | Source | Our System | Resolution |
|---|---|---|---|
| **Color palette offset** | Bronze `#B08D57` accent | Primary `#F2EAD3` beige | Map bronze → primary (both warm accent roles) |
| **Mono font** | Space Mono for labels | No mono font | Use `font-sans` with uppercase tracking for labels |
| **Hardcoded data** | Static text/images in HTML | Strapi CMS data | Fetch from `fetchProperties()` + `fetchGlobal()` |
| **Single-property reality** | 4 hardcoded "properties" | Currently 1 published property | Build for N properties, handle single-property gracefully |
| **No states** | No loading/empty/error UI | System requires all states | Add skeleton, empty, and error states |
| **Animation approach** | Vanilla DOM IntersectionObserver | React with `use client` | Wrap animated sections in client components |
| **Image URLs** | Unsplash direct URLs | Strapi relative URLs | Prepend `strapiUrl` via `getEnv()` |
| **Tailwind version** | CDN v3 with `tailwind.config` | v4 with `@theme inline` | Use our CSS variable tokens |
| **Description field** | Static `<p>` text | Strapi Blocks (rich text) | Render blocks or use first paragraph |
| **Header/Footer** | Magazine-style mix-blend header | Glass Navbar + Footer | **PRESERVED — no changes** |

---

## 4. Design System Mapping

```
SOURCE TOKEN           →  OUR TOKEN                  TAILWIND CLASS
─────────────────────────────────────────────────────────────────────
obsidian (#090909)     →  --color-background (#0a0a0a)  bg-background
carbon  (#141414)      →  --color-surface (#171717)     bg-surface
ivory   (#F4EFE7)      →  --color-primary (#F2EAD3)     text-primary
ivory   (#F4EFE7)      →  --color-secondary (#FFFFFF)   text-secondary
stone   (#8B8B8B)      →  (none)                        text-secondary/50
bronze  (#B08D57)      →  --color-primary (#F2EAD3)     text-primary
forest  (#1F3B34)      →  --color-tertiary (#E9F6D9)    text-tertiary (sparing)

FONT
serif (Playfair)       →  font-display
sans (Inter)           →  font-sans
mono (Space Mono)      →  font-sans + uppercase tracking

SPACING
Tailwind units         →  8px base rhythm (preserved)

BORDERS/RADII
(none specified)       →  rounded-glass (23px), rounded-glass-shell (24px)
```

### Motion mapping

| Source | Our System | Class/Token |
|---|---|---|
| `cubic-bezier(.22,.61,.36,1)` (luxury easing) | Same easing | `ease-[cubic-bezier(0.22,0.61,0.36,1)]` |
| 1s duration | DESIGN.md spec: 1000ms | `duration-1000` |
| Stagger delays (0.1s, 0.2s, 0.3s) | Transition delays | `delay-100`, `delay-200`, `delay-300` |
| Clip-text reveal | Overflow hidden + translateY | `.clip-text` utility class |
| Image mask reveal | clip-path inset | `.img-mask` utility class |
| Scroll trigger | IntersectionObserver | `useScrollReveal` hook |

---

## 5. Adjustments Needed

| # | Adjustment | Detail |
|---|---|---|
| 1 | **Rename sections for our domain** | "The Index" → "Our Properties", "Concrete & Canvas" → property title |
| 2 | **Remove unsupported features** | Source's magazine volume/issue header → removed (our Navbar handles branding) |
| 3 | **Add all states** | Loading skeletons, empty states, error boundaries per section |
| 4 | **Wire to Strapi data** | Every text, image, and label comes from `Property` type + `Global` singleton |
| 5 | **Use our glass treatment** | Feature cards and CTA use `rounded-glass-shell` gradient + `shadow-glass` |
| 6 | **Remove hardcoded Unsplash URLs** | All images via `strapiUrl + media.url` |
| 7 | **Centralize animation CSS** | Add `.clip-text`, `.img-mask`, `.reveal` classes to `globals.css` |
| 8 | **Future-proof for multi-property** | Index section maps `Property[]`, degrades gracefully with 1 item |
| 9 | **Preserve Navbar/Footer** | Both remain exactly as-is; no modifications |
| 10 | **Adapt mono typography** | Use `font-sans` with uppercase + tracking for labels (no Space Mono) |

---

## 6. Final (Aligned) Structure

```
┌──────────────────────────────────────────────────────┐
│  <Navbar />                    ← UNCHANGED           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  <EditorialHero property={featured} strapiUrl={url}> │
│    • Asymmetric grid (7/5 cols)                      │
│    • Oversized display title with clip-text reveal   │
│    • Tall hero image with img-mask reveal            │
│    • Location label chip overlay                     │
│    • "View Details" primary button                   │
│    • States: loading skeleton, empty fallback        │
│                                                      │
│  <FeatureDetail                                       │
│    images={gallery} strapiUrl={url}                   │
│    description={description}                          │
│    title={title} location={location}                  │
│  >                                                    │
│    • Staggered image pair (small square + large tall) │
│    • Editorial descriptive text                       │
│    • Metadata bar (location, type, acreage)           │
│    • Glass surface treatment                          │
│    • States: empty gallery, no description            │
│                                                      │
│  <BrandStatement />                                   │
│    • Centered pull quote with primary accent quote   │
│    • Tagline badge (glass chip)                      │
│    • Scroll reveal animation                         │
│                                                      │
│  <PropertyIndex                                       │
│    properties={allProperties} strapiUrl={url}         │
│  >                                                    │
│    • Numbered property list with titles + locations   │
│    • Cursor-tracking image preview on hover           │
│    • Hover: italic title, bronze accent number        │
│    • States: empty, single property, loading          │
│                                                      │
│  <CtaSection />                 ← KEPT               │
│                                                      │
├──────────────────────────────────────────────────────┤
│  <Footer />                     ← UNCHANGED           │
└──────────────────────────────────────────────────────┘
```

---

## 7. Data Requirements

| Section | Data Source | Required Fields | Fallback |
|---|---|---|---|
| EditorialHero | `fetchProperties()[0]` | `title`, `slug`, `location`, `heroImage`/`heroVideo` | "Welcome to Zenith" static page |
| FeatureDetail | `fetchProperties()[0]` | `gallery`, `description`, `location`, `propertyType`, `acreage` | Skip section if no gallery |
| BrandStatement | `fetchGlobal()` or static | `siteDescription` or hardcoded tagline | Static brand text |
| PropertyIndex | `fetchProperties()` | All published `Property[]` | "No properties" message |
| CtaSection | (static) | — | — |

---

## 8. Implementation Slices

| # | Issue | Title | Type | Blocked By |
|---|---|---|---|---|
| 1 | [#11](https://github.com/Calel33/real-estate-prd/issues/11) | Animation Foundation — CSS reveal classes + useScrollReveal hook | AFK | None |
| 2 | [#12](https://github.com/Calel33/real-estate-prd/issues/12) | EditorialHero — Asymmetric editorial-grid hero section | AFK | #11 |
| 3 | [#13](https://github.com/Calel33/real-estate-prd/issues/13) | BrandStatement — Centered pull quote section | AFK | #11 |
| 4 | [#14](https://github.com/Calel33/real-estate-prd/issues/14) | FeatureDetail — Staggered image feature with description | AFK | #11 |
| 5 | [#15](https://github.com/Calel33/real-estate-prd/issues/15) | PropertyIndex — Interactive property list with cursor preview | AFK | #11 |
| 6 | [#16](https://github.com/Calel33/real-estate-prd/issues/16) | Homepage Composition — Wire all editorial sections together | AFK | #12, #13, #14, #15 |

### Dependency Graph

```
#11 Animation Foundation
 ├─ #12 EditorialHero        ──┐
 ├─ #13 BrandStatement       ──┤
 ├─ #14 FeatureDetail        ──┤  All parallel after #11
 └─ #15 PropertyIndex        ──┘
       └─ #16 Composition     ← Serial final assembly
```

---

## 9. Design Constraints Checklist

- [x] **Colors** — All mapped to project CSS variables (`--color-primary`, `--color-secondary`, `--color-surface`, `--color-background`, `--color-tertiary`)
- [x] **Typography** — `font-display` (Playfair) for display, `font-sans` (Inter) for body/labels
- [x] **Spacing** — 8px base rhythm preserved (matches DESIGN.md)
- [x] **Radii** — `rounded-glass` (23px) and `rounded-glass-shell` (24px) for glass surfaces
- [x] **Shadows** — `shadow-glass` for depth
- [x] **Glass treatment** — `bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]` + `rounded-glass-shell`
- [x] **Easing** — `cubic-bezier(0.22, 0.61, 0.36, 1)` (luxury easing)
- [x] **Motion** — Scroll-triggered reveals, staggered delays, cursor-tracking hover
- [x] **States** — Loading, empty, error, edge cases specified per section
- [x] **Responsive** — Mobile-first: single column on mobile, multi-column on md+
- [x] **Accessibility** — `aria-label` on sections, `role` attributes, semantic HTML
- [x] **No hardcoded values** — All data from Strapi; static text only as fallback
- [x] **Navbar/Footer untouched** — Confirmed no modifications to existing components

---

## 10. Files to Create / Modify

### New files
- `hooks/useScrollReveal.ts` — Scroll-reveal hook (Slice 1)
- `__tests__/useScrollReveal.test.ts` — Hook tests (Slice 1)
- `components/EditorialHero.tsx` — Editorial hero section (Slice 2)
- `components/BrandStatement.tsx` — Pull quote section (Slice 3)
- `components/FeatureDetail.tsx` — Staggered image feature (Slice 4)
- `components/PropertyIndex.tsx` — Interactive property list (Slice 5)

### Modified files
- `app/globals.css` — Add animation utility classes (Slice 1)
- `app/page.tsx` — Compose all sections (Slice 6)

### Preserved files (NO changes)
- `components/Navbar.tsx` — Glass navigation bar
- `components/Footer.tsx` — Glass footer
- `app/layout.tsx` — Root layout
- `components/CtaSection.tsx` — Re-used as-is at bottom of page

---

*Generated 2026-04-29. All design tokens, architectural rules, and constraints verified against project CONTEXT.md and DESIGN.md.*
