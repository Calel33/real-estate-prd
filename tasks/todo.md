# Task List: About Page + Global SEO (Issue #9)

## Phase 1: Dynamic Zone Block Components

- [x] Task 1: Create MediaBlock Component
- [x] Task 2: Create QuoteBlock Component
- [x] Task 3: Create RichTextBlock Component
- [x] Task 4: Create SliderBlock Component
- [x] Task 5: Create DynamicZoneRenderer Component

### Checkpoint: Phase 1 Complete
- [ ] All block components build without errors
- [x] DynamicZoneRenderer correctly dispatches all 4 block types
- [x] Manual review of block rendering with mock data
- [ ] **Review with human before proceeding**

## Phase 2: About Route

- [ ] Task 6: Create About Page (Server Component)
- [ ] Task 7: Create About Loading State
- [ ] Task 8: Create About Error State

### Checkpoint: Phase 2 Complete
- [ ] `/about` route renders content from Strapi
- [ ] Loading skeleton displays during fetch
- [ ] Error boundary catches and displays fetch failures
- [ ] **Review with human before proceeding**

## Phase 3: Global SEO Across All Routes

- [ ] Task 9: Add SEO to About Page
- [ ] Task 10: Update Contact Page to Dynamic Metadata
- [ ] Task 11: Verify Homepage SEO Alignment
- [ ] Task 12: Verify Property Page SEO Alignment

### Checkpoint: Phase 3 Complete
- [ ] All 4 routes have `generateMetadata()`
- [ ] All routes use global `defaultSeo` for consistent branding
- [ ] Property pages use per-property metadata with hero image OG
- [ ] **Review with human before proceeding**

## Phase 4: Testing & Polish

- [ ] Task 13: Write Tests for Dynamic Zone Components
- [ ] Task 14: Write Tests for About Page
- [ ] Task 15: End-to-End Manual Verification

### Checkpoint: Complete
- [ ] All tests pass: `npm test`
- [ ] Production build succeeds: `npm run build`
- [ ] All acceptance criteria from Issue #9 verified
- [ ] **Final review with human — ready for merge**

## Task Dependencies

```
Task 1 ──┐
Task 2 ──┤
Task 3 ──┼──→ Task 5 ──→ Task 6 ──→ Task 7
Task 4 ──┘                    │        │
                              │        └──→ Task 8
                              │
                              └──→ Task 9

Task 10 (independent — can run in parallel with Phase 1)

Task 9 ──┐
Task 10 ─┼──→ Task 11
         └──→ Task 12

Task 5 ──→ Task 13
Task 6 ──→ Task 14

Task 13 ──┐
Task 14 ──┼──→ Task 15
Task 12 ──┘
```
