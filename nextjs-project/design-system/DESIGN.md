---
version: "alpha"
name: "Zenith - The Quiet Expanse"
description: "Zenith Quiet Feature Section is designed for highlighting product capabilities and value points. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for component libraries and responsive product interfaces."
colors:
  primary: "#F2EAD3"
  secondary: "#FFFFFF"
  tertiary: "#E9F6D9"
  neutral: "#FFFFFF"
  background: "#FFFFFF"
  surface: "#F2EAD3"
  text-primary: "#F2EAD3"
  text-secondary: "#FFFFFF"
  border: "#FFFFFF"
  accent: "#F2EAD3"
typography:
  display-lg:
    fontFamily: "Playfair Display"
    fontSize: "200px"
    fontWeight: 400
    lineHeight: "200px"
    letterSpacing: "-0.025em"
  body-md:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "26px"
  label-md:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "1.2px"
    textTransform: "uppercase"
rounded:
  md: "0px"
spacing:
  base: "8px"
  sm: "1px"
  md: "8px"
  lg: "14px"
  xl: "24px"
  gap: "16px"
  card-padding: "32px"
  section-padding: "24px"
components:
  button-link:
    textColor: "{colors.secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "0px"
---

## Overview

- **Composition cues:**
  - Layout: Grid
  - Content Width: Full Bleed
  - Framing: Glassy
  - Grid: Strong

## Colors

The color system uses dark mode with #F2EAD3 as the main accent and #FFFFFF as the neutral foundation.

- **Primary (#F2EAD3):** Main accent and emphasis color.
- **Secondary (#FFFFFF):** Supporting accent for secondary emphasis.
- **Tertiary (#E9F6D9):** Reserved accent for supporting contrast moments.
- **Neutral (#FFFFFF):** Neutral foundation for backgrounds, surfaces, and supporting chrome.

- **Usage:** Background: #FFFFFF; Surface: #F2EAD3; Text Primary: #F2EAD3; Text Secondary: #FFFFFF; Border: #FFFFFF; Accent: #F2EAD3

- **Gradients:** bg-gradient-to-br from-white/30 to-transparent via-white/5, bg-gradient-to-t from-[#171717]/95 to-transparent via-[#171717]/60, bg-gradient-to-t from-[#171717]/95 to-transparent via-[#171717]/80

## Typography

Typography pairs Playfair Display for display hierarchy with Inter for supporting content and interface copy.

- **Display (`display-lg`):** Playfair Display, 200px, weight 400, line-height 200px, letter-spacing -0.025em.
- **Body (`body-md`):** Inter, 16px, weight 400, line-height 26px.
- **Labels (`label-md`):** Inter, 12px, weight 400, line-height 16px, letter-spacing 1.2px, uppercase.

## Layout

Layout follows a grid composition with reusable spacing tokens. Preserve the grid, full bleed structural frame before changing ornament or component styling. Use 8px as the base rhythm and let larger gaps step up from that cadence instead of introducing unrelated spacing values.

Treat the page as a grid / full bleed composition, and keep that framing stable when adding or remixing sections.

- **Layout type:** Grid
- **Content width:** Full Bleed
- **Base unit:** 8px
- **Scale:** 1px, 8px, 14px, 24px, 32px, 40px
- **Section padding:** 24px, 32px
- **Card padding:** 32px
- **Gaps:** 16px, 40px

## Elevation & Depth

Depth is communicated through glass, border contrast, and reusable shadow or blur treatments. Keep those recipes consistent across hero panels, cards, and controls so the page reads as one material system.

Surfaces should read as glass first, with borders, shadows, and blur only reinforcing that material choice.

- **Surface style:** Glass
- **Borders:** 0.67px #FFFFFF
- **Shadows:** rgba(0, 0, 0, 0.25) 0px 25px 50px -12px; rgba(255, 255, 255, 0.02) 0px 0px 40px 0px inset; rgba(255, 255, 255, 0.05) 0px 0px 10px 0px inset
- **Blur:** 4px

### Techniques
- **Gradient border shell:** Use a thin gradient border shell around the main card. Wrap the surface in an outer shell with 1px padding and a 24px radius. Drive the shell with linear-gradient(to right bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0)) so the edge reads like premium depth instead of a flat stroke. Keep the actual stroke understated so the gradient shell remains the hero edge treatment. Inset the real content surface inside the wrapper with a slightly smaller radius so the gradient only appears as a hairline frame.

## Shapes

Shapes rely on a tight radius system anchored by 23px and scaled across cards, buttons, and supporting surfaces. Icon geometry should stay compatible with that soft-to-controlled silhouette.

Use the radius family intentionally: larger surfaces can open up, but controls and badges should stay within the same rounded DNA instead of inventing sharper or pill-only exceptions.

- **Corner radii:** 23px, 24px, 9999px

## Components

Anchor interactions to the detected button styles.

### Buttons
- **Links:** text #FFFFFF, radius 0px, padding 0px, border 0px solid rgb(229, 231, 235).

## Do's and Don'ts

Use these constraints to keep future generations aligned with the current system instead of drifting into adjacent styles.

### Do
- Do use the primary palette as the main accent for emphasis and action states.
- Do keep spacing aligned to the detected 8px rhythm.
- Do reuse the Glass surface treatment consistently across cards and controls.
- Do keep corner radii within the detected 23px, 24px, 9999px family.

### Don't
- Don't introduce extra accent colors outside the core palette roles unless the page needs a new semantic state.
- Don't mix unrelated shadow or blur recipes that break the current depth system.
- Don't exceed the detected moderate motion intensity without a deliberate reason.

## Motion

Motion feels controlled and interface-led across text, layout, and section transitions. Timing clusters around 1000ms and 300ms. Easing favors ease and 0. Hover behavior focuses on text and color changes. Scroll choreography uses GSAP ScrollTrigger for section reveals and pacing.

**Motion Level:** moderate

**Durations:** 1000ms, 300ms, 15000ms

**Easings:** ease, 0, 0.2, 1), cubic-bezier(0.4, cubic-bezier(0

**Hover Patterns:** text, color

**Scroll Patterns:** gsap-scrolltrigger
