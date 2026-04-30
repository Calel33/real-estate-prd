# Task List: Revalidation Webhook (Issue #10)

## Phase 1: Route Handler Rewrite

- [x] Task 1: Rewrite `/api/revalidate` Route Handler

### Checkpoint: Phase 1 Complete
- [x] Route handler builds without errors
- [x] Manual curl tests pass for all 4 auth/path scenarios
- [x] **Review with human before proceeding**

## Phase 2: Integration Tests

- [x] Task 2: Create Revalidate Integration Tests

### Checkpoint: Core Functionality Complete
- [x] All tests pass
- [x] Route handler works with both path and tag revalidation
- [x] **Review with human before proceeding**

## Phase 3: Strapi Integration

- [x] Task 3: Add Strapi Document Service Middleware
- [x] Task 4: Add Strapi Environment Variables

### Checkpoint: Complete
- [x] All tests pass: `npm test` in `nextjs-project/`
- [x] Next.js build succeeds: `npm run build`
- [ ] Strapi dev server starts without errors
- [ ] Manual end-to-end test: publish property in Strapi → Next.js page revalidates
- [ ] **Final review with human — ready for merge**

## Task Dependencies

```
Task 1 ──→ Task 2
              │
              └──→ Task 3 ──→ Task 4
```

## Deferred (Separate Issue)

- [ ] Change `DEFAULT_REVALIDATE` from `0` to `3600` in `lib/fetch.ts`
- [ ] Remove `revalidate: 0` overrides in `fetch-property.ts`, `fetch-about.ts`, `fetch-global.ts`
- [ ] Update fetch tests to expect `revalidate: 3600`
