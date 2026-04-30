# Implementation Plan: About Page + Global SEO (Issue #9)

## Overview

Build the `/about` route that fetches content from Strapi's `about` single type and renders dynamic zone blocks (media, quote, rich-text, slider). Additionally, wire up `generateMetadata()` across all routes (home, properties, about, contact) using the global `defaultSeo` from Strapi for consistent SEO and Open Graph metadata.

**Blocking dependency:** Issue #3 (Foundation: Design System + Layout Shell) must be merged first, as this plan builds on top of the existing layout, fetch functions, and schema infrastructure.

## Architecture Decisions

1. **Dynamic Zone Renderer**: Create a dedicated `DynamicZoneRenderer` component that dispatches to block-specific renderers based on `__component` discriminator. This keeps the About page clean and makes block components reusable.
2. **Block Components**: Each dynamic zone type (`shared.media`, `shared.quote`, `shared.rich-text`, `shared.slider`) gets its own component file for testability and maintainability.
3. **SEO Pattern**: Follow the existing `generateMetadata()` pattern from `app/page.tsx` and `app/properties/[slug]/page.tsx` — fetch global data, use `defaultSeo` for title/description/OG image.
4. **Loading/Error States**: Reuse the pattern from existing routes — `loading.tsx` with skeleton matching layout, `error.tsx` with retry button.
5. **Metadata for Contact**: Convert contact page from static `metadata` export to async `generateMetadata()` to pull from global settings.

## Dependency Graph

```
Strapi about single type (existing)
    │
    ├── fetchAbout() (lib/fetch-about.ts — EXISTS)
    ├── AboutSchema (lib/schemas/about.ts — EXISTS)
    │
    ├── DynamicZoneRenderer (NEW — dispatches to block components)
    │       ├── MediaBlock (NEW)
    │       ├── QuoteBlock (NEW)
    │       ├── RichTextBlock (NEW — may reuse StrapiBlocksRenderer)
    │       └── SliderBlock (NEW)
    │
    └── app/about/ (NEW route)
            ├── page.tsx (Server Component)
            ├── loading.tsx
            └── error.tsx

Global SEO (cross-cutting)
    ├── fetchGlobal() (lib/fetch-global.ts — EXISTS)
    ├── SeoSchema (lib/schemas/global.ts — EXISTS)
    │
    ├── app/page.tsx (MODIFY — already has generateMetadata, verify alignment)
    ├── app/properties/[slug]/page.tsx (MODIFY — already has generateMetadata, verify alignment)
    ├── app/about/page.tsx (NEW — add generateMetadata)
    └── app/contact/page.tsx (MODIFY — convert static metadata to generateMetadata)
```

## Task List

### Phase 1: Dynamic Zone Block Components

Foundation — build the reusable block renderers before wiring them into the About page.

---

## Task 1: Create MediaBlock Component

**Description:** Render `shared.media` blocks from Strapi's about dynamic zone. Displays an image file with optional caption using Next.js `<Image>` component.

**Acceptance criteria:**
- [ ] Accepts `file` prop matching `StrapiMediaSchema` shape
- [ ] Renders responsive image with `next/image` using Strapi URL
- [ ] Displays `alternativeText` or `caption` as accessible alt text
- [ ] Applies design system styling (rounded corners, glass surface treatment)
- [ ] Handles missing/null file gracefully (renders nothing)

**Verification:**
- [ ] Component renders in isolation with mock data
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: image displays correctly at mobile/tablet/desktop widths

**Dependencies:** None

**Files likely touched:**
- `nextjs-project/components/blocks/MediaBlock.tsx`

**Estimated scope:** Small (1 file)

---

## Task 2: Create QuoteBlock Component ✅ COMPLETE

**Description:** Render `shared.quote` blocks from Strapi's about dynamic zone. Displays a styled quote with title and body text using design system typography tokens.

**Acceptance criteria:**
- [x] Accepts `title` (string) and `body` (string) props
- [x] Renders title with `font-display` and `text-primary` styling
- [x] Renders body with `text-secondary/70` styling
- [x] Includes visual quote treatment (left border or quotation mark accent)
- [x] Fully responsive typography scaling

**Verification:**
- [x] Component renders in isolation with mock data (10 tests pass)
- [x] Build succeeds: `npm run build`
- [x] Manual check: quote styling matches dark glass aesthetic

**Dependencies:** None

**Files likely touched:**
- `nextjs-project/components/blocks/QuoteBlock.tsx`

**Estimated scope:** Small (1 file)

---

## Task 3: Create RichTextBlock Component

**Description:** Render `shared.rich-text` blocks from Strapi's about dynamic zone. Wraps the existing `StrapiBlocksRenderer` to handle the `body` field which contains Strapi rich text block nodes.

**Acceptance criteria:**
- [ ] Accepts `body` prop (string — Strapi rich text JSON or serialized blocks)
- [ ] Delegates rendering to existing `StrapiBlocksRenderer` component
- [ ] Handles null/empty body gracefully
- [ ] Applies consistent spacing within the dynamic zone flow

**Verification:**
- [ ] Component renders in isolation with mock rich text data
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: rich text formatting (headings, bold, links) displays correctly

**Dependencies:** Task 1 (for file structure convention)

**Files likely touched:**
- `nextjs-project/components/blocks/RichTextBlock.tsx`

**Estimated scope:** Small (1 file)

---

## Task 4: Create SliderBlock Component

**Description:** Render `shared.slider` blocks from Strapi's about dynamic zone. Displays a horizontally scrollable gallery of media files with smooth scrolling behavior.

**Acceptance criteria:**
- [ ] Accepts `files` prop (array of `StrapiMediaSchema`)
- [ ] Renders horizontally scrollable container with CSS snap points
- [ ] Each image uses `next/image` with proper aspect ratio
- [ ] Touch-friendly swipe scrolling on mobile
- [ ] Handles single file and empty array gracefully

**Verification:**
- [ ] Component renders in isolation with mock file array
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: horizontal scroll works on desktop (mouse drag) and mobile (touch swipe)

**Dependencies:** Task 1 (for MediaBlock reuse or image pattern)

**Files likely touched:**
- `nextjs-project/components/blocks/SliderBlock.tsx`

**Estimated scope:** Small (1 file)

---

## Task 5: Create DynamicZoneRenderer Component

**Description:** Build the dispatcher component that takes an array of `AboutBlock` objects and renders the appropriate block component based on the `__component` discriminator field.

**Acceptance criteria:**
- [ ] Accepts `blocks` prop matching `AboutBlock[]` type
- [ ] Switches on `__component` field: `shared.media` → MediaBlock, `shared.quote` → QuoteBlock, `shared.rich-text` → RichTextBlock, `shared.slider` → SliderBlock
- [ ] Renders unknown component types with a fallback (logs warning, renders nothing or placeholder)
- [ ] Applies consistent vertical spacing between blocks (`space-y-*`)
- [ ] Handles null/empty blocks array (renders nothing)

**Verification:**
- [ ] Component renders with mock data containing all 4 block types
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: all block types render in correct order with proper spacing

**Dependencies:** Tasks 1-4

**Files likely touched:**
- `nextjs-project/components/DynamicZoneRenderer.tsx`

**Estimated scope:** Small (1-2 files)

---

### Checkpoint: Phase 1 Complete

- [ ] All block components build without errors
- [ ] DynamicZoneRenderer correctly dispatches all 4 block types
- [ ] Manual review of block rendering with mock data
- [ ] **Review with human before proceeding**

---

### Phase 2: About Route

Wire up the `/about` page as a complete vertical slice with data fetching, rendering, loading, and error states.

---

## Task 6: Create About Page (Server Component)

**Description:** Create `app/about/page.tsx` as an async Server Component that fetches about content via `fetchAbout()` and renders the title + dynamic zone blocks.

**Acceptance criteria:**
- [ ] Route at `/about` is accessible
- [ ] Fetches data via `fetchAbout()` in Server Component
- [ ] Displays page title from `about.title` field
- [ ] Passes `about.blocks` to `DynamicZoneRenderer`
- [ ] Has `export const dynamic = "force-dynamic"` for runtime rendering
- [ ] Fully responsive layout (mobile, tablet, desktop)

**Verification:**
- [ ] `npm run dev` — navigate to `/about`, content renders
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: page layout matches design system (dark mode, glass surfaces, typography)

**Dependencies:** Task 5

**Files likely touched:**
- `nextjs-project/app/about/page.tsx`

**Estimated scope:** Small (1 file)

---

## Task 7: Create About Loading State

**Description:** Create `app/about/loading.tsx` with a skeleton that matches the About page layout structure (title placeholder + block placeholders).

**Acceptance criteria:**
- [ ] Title skeleton matches `font-display` size and position
- [ ] Block skeletons approximate content height (varied heights for different block types)
- [ ] Uses `animate-pulse` and design system colors (`bg-surface/50`)
- [ ] Responsive — skeleton adapts to viewport width

**Verification:**
- [ ] Slow network throttle in DevTools shows loading skeleton
- [ ] Build succeeds: `npm run build`
- [ ] Manual check: skeleton visually matches final layout structure

**Dependencies:** Task 6

**Files likely touched:**
- `nextjs-project/app/about/loading.tsx`

**Estimated scope:** XS (1 file)

---

## Task 8: Create About Error State

**Description:** Create `app/about/error.tsx` with an error boundary that displays the error message and a "Try Again" retry button.

**Acceptance criteria:**
- [ ] Has `"use client"` directive (required for error boundary)
- [ ] Displays "Something went wrong" heading with `font-display` styling
- [ ] Shows `error.message` in secondary text color
- [ ] "Try Again" button calls `reset()` to retry the fetch
- [ ] Centered layout matching existing error.tsx pattern

**Verification:**
- [ ] Throw error in `fetchAbout()` — error boundary displays
- [ ] Click "Try Again" — retry attempt occurs
- [ ] Build succeeds: `npm run build`

**Dependencies:** Task 6

**Files likely touched:**
- `nextjs-project/app/about/error.tsx`

**Estimated scope:** XS (1 file)

---

### Checkpoint: Phase 2 Complete

- [ ] `/about` route renders content from Strapi
- [ ] Loading skeleton displays during fetch
- [ ] Error boundary catches and displays fetch failures
- [ ] **Review with human before proceeding**

---

### Phase 3: Global SEO Across All Routes

Wire up `generateMetadata()` on every route using `fetchGlobal()` and `defaultSeo`.

---

## Task 9: Add SEO to About Page ✅ COMPLETE

**Description:** Add `generateMetadata()` to `app/about/page.tsx` that fetches global settings and uses `defaultSeo` for title, description, and OG image.

**Acceptance criteria:**
- [ ] `generateMetadata()` fetches `fetchGlobal()` 
- [ ] Title uses `globalData.defaultSeo?.metaTitle` with site name fallback
- [ ] Description uses `globalData.defaultSeo?.metaDescription`
- [ ] OG image uses `globalData.defaultSeo?.shareImage` with Strapi URL
- [ ] Metadata is correct when viewing page source / sharing link

**Verification:**
- [ ] View page source — `<title>` and `<meta>` tags present
- [ ] Use Open Graph preview tool or browser devtools to verify OG tags
- [ ] Build succeeds: `npm run build`

**Dependencies:** Task 6

**Files likely touched:**
- `nextjs-project/app/about/page.tsx` (add generateMetadata function)

**Estimated scope:** XS (1 file, modify existing)

---

## Task 10: Update Contact Page to Dynamic Metadata ✅ COMPLETE

**Description:** Convert `app/contact/page.tsx` from static `metadata` export to async `generateMetadata()` that fetches global settings for consistent SEO.

**Acceptance criteria:**
- [ ] Remove static `export const metadata` 
- [ ] Add `export async function generateMetadata()` 
- [ ] Fetches `fetchGlobal()` for site name and defaultSeo
- [ ] Title includes site name from global settings
- [ ] Description uses `defaultSeo.metaDescription`
- [ ] OG image uses `defaultSeo.shareImage` if available

**Verification:**
- [ ] View page source — `<title>` reflects global site name
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors from metadata type change

**Dependencies:** None (independent of About page tasks)

**Files likely touched:**
- `nextjs-project/app/contact/page.tsx`

**Estimated scope:** XS (1 file, modify existing)

---

## Task 11: Verify Homepage SEO Alignment ✅ COMPLETE

**Description:** Review `app/page.tsx` `generateMetadata()` to ensure it follows the same pattern as other routes and uses all available `defaultSeo` fields consistently.

**Acceptance criteria:**
- [ ] Title uses `globalData.siteName` (already implemented)
- [ ] Description uses `globalData.defaultSeo?.metaDescription` (already implemented)
- [ ] OG image uses `globalData.defaultSeo?.shareImage` (already implemented)
- [ ] No hardcoded "Zenith" strings — all from global settings
- [ ] Code style matches other routes' `generateMetadata()` implementations

**Verification:**
- [ ] Read `app/page.tsx` — confirm alignment with Tasks 9 and 10
- [ ] Build succeeds: `npm run build`
- [ ] If changes needed, implement and re-verify

**Dependencies:** Tasks 9, 10 (for pattern consistency comparison)

**Files likely touched:**
- `nextjs-project/app/page.tsx` (possibly no changes, just verification)

**Estimated scope:** XS (1 file, read-only or minor edits)

---

## Task 12: Verify Property Page SEO Alignment ✅ COMPLETE

**Description:** Review `app/properties/[slug]/page.tsx` `generateMetadata()` to ensure per-property metadata uses property title, description, and hero image as OG image consistently.

**Acceptance criteria:**
- [ ] Title format: `${property.title} — ${globalData.siteName}` (update from hardcoded "Zenith")
- [ ] Description uses property location/acreage details (already implemented)
- [ ] OG image uses `property.heroImage` (already implemented)
- [ ] Falls back to `defaultSeo.shareImage` if property has no hero image
- [ ] Code style matches other routes' `generateMetadata()` implementations

**Verification:**
- [ ] Read `app/properties/[slug]/page.tsx` — confirm alignment
- [ ] Build succeeds: `npm run build`
- [ ] If changes needed (e.g., fetching global for site name), implement and re-verify

**Dependencies:** Tasks 9, 10 (for pattern consistency)

**Files likely touched:**
- `nextjs-project/app/properties/[slug]/page.tsx` (possibly modify title to use global siteName)

**Estimated scope:** Small (1 file, minor edits)

---

### Checkpoint: Phase 3 Complete

- [ ] All 4 routes (home, properties, about, contact) have `generateMetadata()`
- [ ] All routes use global `defaultSeo` for consistent branding
- [ ] Property pages use per-property metadata with hero image OG
- [ ] **Review with human before proceeding**

---

### Phase 4: Testing & Polish

Add tests and final verification.

---

## Task 13: Write Tests for Dynamic Zone Components

**Description:** Write unit tests for `DynamicZoneRenderer` and each block component to verify correct rendering and edge cases.

**Acceptance criteria:**
- [ ] `MediaBlock` test: renders image with correct src, handles null file
- [ ] `QuoteBlock` test: renders title and body, handles missing props
- [ ] `RichTextBlock` test: delegates to StrapiBlocksRenderer, handles empty body
- [ ] `SliderBlock` test: renders multiple images, handles empty array
- [ ] `DynamicZoneRenderer` test: dispatches all 4 block types, handles unknown type, handles empty array

**Verification:**
- [ ] `npm test` — all new tests pass
- [ ] Build succeeds: `npm run build`
- [ ] Test coverage includes happy path and edge cases

**Dependencies:** Tasks 1-5

**Files likely touched:**
- `nextjs-project/components/blocks/MediaBlock.test.tsx`
- `nextjs-project/components/blocks/QuoteBlock.test.tsx`
- `nextjs-project/components/blocks/RichTextBlock.test.tsx`
- `nextjs-project/components/blocks/SliderBlock.test.tsx`
- `nextjs-project/components/DynamicZoneRenderer.test.tsx`

**Estimated scope:** Medium (5 test files)

---

## Task 14: Write Tests for About Page

**Description:** Write tests for the About page route including loading state, error state, and successful rendering.

**Acceptance criteria:**
- [ ] `page.test.tsx`: renders title and blocks when fetch succeeds
- [ ] `loading.test.tsx`: renders skeleton structure
- [ ] `error.test.tsx`: renders error message and retry button

**Verification:**
- [ ] `npm test` — all tests pass
- [ ] Build succeeds: `npm run build`
- [ ] Test patterns match existing route tests (`app/page.test.tsx`, `app/properties/[slug]/page.test.tsx`)

**Dependencies:** Tasks 6-8

**Files likely touched:**
- `nextjs-project/app/about/page.test.tsx`
- `nextjs-project/app/about/loading.test.tsx`
- `nextjs-project/app/about/error.test.tsx`

**Estimated scope:** Medium (3 test files)

---

## Task 15: End-to-End Manual Verification

**Description:** Complete manual verification of the entire feature against all acceptance criteria from Issue #9.

**Acceptance criteria:**
- [ ] `/about` route fetches content via `fetchAbout()` in Server Component
- [ ] Dynamic zone block renderer handles all 4 component types
- [ ] About page content renders from Strapi single type
- [ ] `generateMetadata()` implemented on every route (home, properties, about, contact)
- [ ] Per-property metadata uses property title, description, and hero image as OG image
- [ ] Loading skeleton matches layout structure during data fetch
- [ ] Error boundary displays error message with retry button on fetch failure
- [ ] Fully responsive on mobile, tablet, desktop

**Verification:**
- [ ] `npm run build` — production build succeeds
- [ ] `npm run dev` — manual navigation through all routes
- [ ] DevTools responsive mode: test at 375px, 768px, 1024px, 1440px
- [ ] View source on each route — verify meta tags
- [ ] Simulate Strapi downtime — verify error states

**Dependencies:** Tasks 1-14

**Files likely touched:** None (verification only)

**Estimated scope:** Verification task

---

### Checkpoint: Complete

- [ ] All tests pass: `npm test`
- [ ] Production build succeeds: `npm run build`
- [ ] All acceptance criteria from Issue #9 verified
- [ ] **Final review with human — ready for merge**

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Strapi `about` single type schema differs from expected | High | Verify schema with `GET /api/about?populate=*` before Task 6 |
| `defaultSeo.shareImage` URL format inconsistent | Medium | Check existing `app/page.tsx` implementation for URL construction pattern |
| Rich text `body` field format differs from `StrapiBlocksRenderer` expectations | Medium | Inspect actual Strapi response in Task 3, adapt wrapper accordingly |
| SliderBlock CSS scroll-snap not smooth on all browsers | Low | Use well-supported CSS properties, test on multiple viewports |

## Open Questions

1. **Strapi content readiness:** Is the `about` single type already populated with content in the development Strapi instance, or does it need to be seeded first?
2. **Block ordering:** Should dynamic zone blocks render in the exact order returned by Strapi, or is there a preferred display order?
3. **Slider interaction:** Should the slider have navigation arrows/dots, or is pure scroll-snap sufficient for v1?
4. **SEO fallback hierarchy:** If `defaultSeo` is null, should we fall back to `siteDescription` and `siteName`, or use hardcoded defaults?

## Parallelization Opportunities

- **Tasks 1-4** (block components) can be developed in parallel — they are independent of each other
- **Task 10** (contact metadata) can be done in parallel with Phase 1 — no dependency on About page
- **Tasks 11-12** (SEO verification) can be done in parallel with each other
- **Tasks 13-14** (tests) can be written in parallel once components exist
