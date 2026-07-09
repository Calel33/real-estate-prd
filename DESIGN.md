# Zenith Monolith Glass

## Overview

A dark-mode-only luxury real estate interface for premium property discovery and digital-asset-forward ownership. The aesthetic is cinematic, editorial, and technical: full-bleed property imagery, warm cream typography, glass-panel surfaces, precise index labels, and high-contrast black framing. The mood should feel exclusive and modern without becoming cold, with large moments of atmosphere balanced by sharp, data-like property details.

## Colors

- **Primary** (`#F2EAD3`): Warm cream used for display headings, key labels, primary CTAs, active/focus states, and premium emphasis.
- **Primary Hover** (`rgba(242,234,211,0.9)`): Slightly softened cream for hover states on filled primary actions.
- **Secondary** (`#FFFFFF`): Main readable text, navigation links, descriptions, and interface copy.
- **Secondary Muted** (`rgba(255,255,255,0.4)`): Supporting metadata, captions, table labels, scan codes, and inactive copy.
- **Tertiary** (`#E9F6D9`): Reserved soft green accent for rare supporting highlights only.
- **Background** (`#0A0A0A`): Global page background and bottom index bars.
- **Surface** (`#171717`): Cards, form fields, glass interiors, mobile menus, gallery placeholders, and panels.
- **Glass Border** (`rgba(255,255,255,0.05)` to `rgba(255,255,255,0.3)`): Gradient shells, dividers, panel edges, and subtle structure.
- **Success** (`#4ADE80` / green-400): Form success states.
- **Error** (`#F87171` / red-400): Validation messages and form error states.

## Typography

- **Display Font**: Playfair Display, loaded through `next/font/google`
- **Body/UI Font**: Inter, loaded through `next/font/google`

Display typography uses Playfair Display for cinematic, luxury editorial moments. Headings are large, uppercase, tightly tracked, and often compressed with very low line heights. Body and interface text use Inter for clarity, especially in navigation, labels, forms, metadata, and technical property rows.

Type scale:

- **Hero Display**: `clamp(3.5rem, 12vw, 12rem)`, uppercase, `font-black`, `leading-[0.85]`, `tracking-[-0.03em]`
- **Index Display**: `clamp(3rem, 12vw, 10rem)`, uppercase, `leading-[0.8]`, `tracking-[-0.05em]`
- **Page Heading**: `3xl` to `5xl`, Playfair Display, cream
- **Property Row Title**: `2xl` to `5xl`, uppercase, tight tracking
- **Body**: `text-lg` to `text-xl` for marketing copy, `text-sm` to `text-base` for UI copy
- **Technical Labels**: `8px` to `10px`, uppercase, wide tracking from `0.25em` to `0.5em`

## Elevation

Elevation is created through glass, blur, opacity, and gradient borders rather than heavy shadows. The core glass surface uses `bg-surface/50`, `backdrop-blur-[4px]`, and `shadow-glass`. Gradient shells wrap glass cards with a 1px luminous edge using `bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]`.

Cards and navigation should feel suspended over the dark canvas. Hover elevation is subtle: rows shift horizontally, borders brighten, images reveal or scale slightly, and CTAs invert from transparent cream to filled cream.

## Components

- **Glass Shells**: Use a rounded outer shell with gradient border and a blurred dark surface inside. Standard pattern: `rounded-glass-shell bg-gradient-to-br from-white/30 via-white/5 to-transparent p-[1px]` wrapping `rounded-glass bg-surface/50 backdrop-blur-[4px] shadow-glass`.
- **Buttons / CTAs**: Primary CTAs are rounded-full or rounded-glass, cream-filled with black text, or transparent cream-tinted glass that fills cream on hover. Text is small, uppercase, widely tracked, and medium weight.
- **Navigation**: Fixed top navigation inside a floating glass shell, margin `mx-4 mt-4`, rounded glass, blurred surface, compact links, Playfair logo mark, and mobile glass dropdown.
- **Hero Sections**: Fullscreen or near-fullscreen image-led sections with dark gradient overlays, Playfair uppercase headline, optional side brand rail, animated slide-up content, and restrained descriptive copy.
- **Property Index Rows**: 12-column technical table layout with reference numbers, uppercase property names, muted metadata, hover background tint, left padding shift, brighter border, and cursor-follow image reveal on desktop.
- **Property Detail Cards**: Glass panels with section labels like `Technical_Highlights`, numbered list rows, uppercase labels, and muted technical descriptions.
- **Gallery Grid**: 12-column mosaic with large first image, tall second image, smaller follow-on tiles, no rounded corners by default, hover image scale, and black scan-code tags appearing on hover.
- **Forms**: Slab-like full-width fields on dark surface, oversized bold text, no full border, 2px left border used for focus and errors. Focus increases left padding and changes background to `#1a1a1a`.
- **Status Messages**: Rounded glass-radius blocks with translucent semantic backgrounds, subtle borders, and green or red text.
- **Footer**: Compact glass shell matching the nav system, muted secondary text, and simple two-column layout on desktop.

## Spacing

- Base rhythm: **8px**
- Scale: `8, 16, 24, 32, 40, 48, 64, 80, 96, 128px`
- Page gutters: `px-6` on mobile, `lg:px-20` for wide editorial sections
- Container width: `max-w-7xl` with centered layout for content-heavy sections
- Section spacing: `py-16 md:py-24` for standard sections, `py-24 md:py-32` for CTA sections
- Hero spacing: generous vertical padding, usually `py-24` or larger
- Grid gap: `gap-10` to `gap-20` for editorial grids, `gap-[15px]` for mosaic galleries
- Glass card padding: `p-8 md:p-10`, `px-6 py-16 md:py-20` for large CTA panels

## Border Radius

- **0px**: Image tiles, index rows, technical dividers, and table-like structures
- **23px (`rounded-glass`)**: Inner glass cards, nav content surfaces, dropdowns, detail panels
- **24px (`rounded-glass-shell`)**: Outer gradient shells around glass panels
- **9999px (`rounded-full`)**: Primary pill CTAs, small status dots, circular controls

## Motion

- Use `animate-slide-up` for hero content with staggered delays from `100ms` to `600ms`.
- Standard easing favors `cubic-bezier(0.16, 1, 0.3, 1)` for premium, smooth movement.
- Hover transitions are slow and deliberate, commonly `duration-500` to `duration-700`.
- Respect reduced motion by simplifying animation to opacity-only changes.

## Do's and Don'ts

- Do keep the experience dark-mode-only with `bg-background` and `text-secondary`.
- Do use `text-primary` for premium emphasis, display headlines, labels, and primary interactive states.
- Do use Playfair Display for large editorial moments and Inter for body/UI copy.
- Do keep technical labels uppercase with wide tracking and small sizes.
- Do use the glass shell pattern for nav, footer, CTAs, and important panels.
- Do preserve the 12-column property index and gallery systems for structured pages.
- Do use opacity as hierarchy: `text-secondary/70`, `/50`, `/40`, `/30`, and `/20`.
- Do use direct, confident real estate copy that fits the premium investment tone.
- Don't introduce a light theme or white page backgrounds.
- Don't add saturated decorative colors outside semantic success/error states.
- Don't use generic gray card systems when the glass token system is available.
- Don't replace technical labels like `Portfolio_Holdings`, `SEC_01`, or `Aerial_Documentation` with casual labels.
- Don't overuse shadows, gradients, or illustrations. The atmosphere should come from imagery, glass, typography, and spacing.
- Don't hardcode new colors when existing theme tokens can express the design.
