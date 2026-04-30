# Implementation Plan: Revalidation Webhook (Issue #10)

## Overview

Implement on-demand cache revalidation so the site reflects CMS changes immediately without manual redeploy. This requires rewriting the existing `/api/revalidate` route handler to support path-based revalidation (`revalidatePath`), adding integration tests, and configuring Strapi to trigger the endpoint on property publish/unpublish events.

**Blocked by:** Issue #5 (must be merged first).

**Key context:** The current implementation uses tag-based revalidation (`revalidateTag`) with Bearer header auth. The issue AC specifies path-based revalidation (`revalidatePath`) with query param secret. Research recommends keeping Bearer header auth (industry best practice — avoids log exposure) and supporting BOTH `revalidatePath` (precision) and `revalidateTag` (breadth).

## Architecture Decisions

1. **Auth mechanism**: Keep `Authorization: Bearer` header instead of query param `?secret=`. Superior security — tokens don't leak into server logs, URL history, or referrer headers. Matches Strapi webhook custom header capability.
2. **Dual revalidation**: Support BOTH `revalidatePath(path)` for specific pages (e.g., `/properties/[slug]`) AND `revalidateTag(tag, { expire: 0 })` for broad invalidation. Best of both worlds.
3. **Strapi integration**: Document Service middleware in `server/src/index.ts` (code-based, version-controlled) instead of Admin UI webhooks. Recommended for Strapi v5.
4. **Tag expiration profile**: Use `{ expire: 0 }` for webhook-triggered tag revalidation per Next.js 16 official docs (immediate expiration).
5. **`revalidate: 3600` deferred**: All fetch functions currently use `revalidate: 0` (intentional fix for hero image cache staleness). Reverting to `3600` requires the webhook to be verified reliable first. Deferred to separate issue.

## Dependency Graph

```
Issue #5 (blocking prerequisite)
    │
    ├── Next.js route handler (MODIFY)
    │       ├── Accepts path (query param or body) + optional tags
    │       ├── Bearer header auth (KEEP existing)
    │       ├── revalidatePath(path) for path-based invalidation
    │       └── revalidateTag(tag, { expire: 0 }) for tag-based invalidation
    │               │
    │               └── Integration tests (CREATE)
    │
    └── Strapi middleware (MODIFY server/src/index.ts)
            ├── Fires on publish/unpublish/delete for api::property.property
            ├── Fire-and-forget HTTP call to NextJS_REVALIDATE_URL
            └── Uses shared REVALIDATION_SECRET env var
```

## Task List

### Phase 1: Route Handler Rewrite

Rewrite the existing `/api/revalidate` endpoint to support path-based revalidation while preserving tag-based support.

---

## Task 1: Rewrite `/api/revalidate` Route Handler

**Description:** Modify `app/api/revalidate/route.ts` to accept a required `path` parameter (query param or body field), call `revalidatePath(path)` for path-based invalidation, and optionally accept `tags` for tag-based invalidation. Keep Bearer header auth. Return 400 when path is missing, 401 when secret is wrong/missing, 200 on success.

**Acceptance criteria:**
- [ ] `Authorization: Bearer <correct-secret>` + `path=/properties/slug` → calls `revalidatePath('/properties/slug', 'page')` → returns 200
- [ ] `Authorization: Bearer <wrong-secret>` → returns 401 with error message
- [ ] No `Authorization` header → returns 401 with error message
- [ ] Valid auth but no `path` → returns 400 with error message
- [ ] `path` accepted from query param `?path=...` OR body field `{ "path": "..." }`
- [ ] Optional `tags` body field still works: `{ "path": "...", "tags": ["properties"] }` revalidates both path and tags
- [ ] `revalidateTag` uses `{ expire: 0 }` profile (not deprecated `"seconds"` string)

**Verification:**
- [ ] Build succeeds: `npm run build` in `nextjs-project/`
- [ ] Manual curl test: `curl -X POST http://localhost:3000/api/revalidate -H "Authorization: Bearer test-secret" -H "Content-Type: application/json" -d '{"path":"/properties/test"}'` returns 200
- [ ] TypeScript compiles without errors

**Dependencies:** None (modifies existing file)

**Files likely touched:**
- `nextjs-project/app/api/revalidate/route.ts`

**Estimated scope:** Small (1 file)

---

### Checkpoint: Phase 1 Complete
- [ ] Route handler builds without errors
- [ ] Manual curl tests pass for all 4 auth/path scenarios
- [ ] **Review with human before proceeding**

---

### Phase 2: Integration Tests

Create the first tests for the revalidation endpoint, following the existing `contact.test.ts` pattern.

---

## Task 2: Create Revalidate Integration Tests

**Description:** Create `__tests__/api/revalidate.test.ts` with all 4 required test scenarios from the issue AC, plus a bonus test for tag-based revalidation. Follow the existing test patterns from `contact.test.ts` — `@vitest-environment node`, `vi.mock` for `next/cache` and `@/lib/env`, `createRequest` helper.

**Acceptance criteria:**
- [ ] Test: correct secret + valid path → `revalidatePath` called → returns 200
- [ ] Test: wrong secret → returns 401
- [ ] Test: no secret (missing header) → returns 401
- [ ] Test: valid auth but missing path → returns 400
- [ ] Bonus test: valid auth + tags body → `revalidateTag` called with `{ expire: 0 }` → returns 200
- [ ] Mocks `revalidatePath` and `revalidateTag` from `next/cache`
- [ ] Mocks `getEnv` from `@/lib/env` with `REVALIDATE_SECRET: "test-secret"`

**Verification:**
- [ ] `npm test -- --grep "revalidate"` — all tests pass
- [ ] Build succeeds: `npm run build`
- [ ] Test file follows same structure as `__tests__/api/contact.test.ts`

**Dependencies:** Task 1

**Files likely touched:**
- `nextjs-project/__tests__/api/revalidate.test.ts` (CREATE)

**Estimated scope:** Small (1 file)

---

### Checkpoint: Core Functionality Complete
- [ ] All tests pass
- [ ] Route handler works with both path and tag revalidation
- [ ] **Review with human before proceeding**

---

### Phase 3: Strapi Integration

Add Document Service middleware to Strapi so it automatically calls the Next.js revalidation endpoint when properties are published, unpublished, or deleted.

---

## Task 3: Add Strapi Document Service Middleware

**Description:** Modify `server/src/index.ts` to register Document Service middleware that fires on `publish`, `unpublish`, and `delete` actions for `api::property.property`. Uses `setImmediate` for fire-and-forget HTTP call to the Next.js revalidation endpoint. Sends the property slug so Next.js can revalidate the specific path.

**Acceptance criteria:**
- [ ] Middleware registered in `register()` function of `server/src/index.ts`
- [ ] Filters to only `api::property.property` content type
- [ ] Triggers on `publish`, `unpublish`, and `delete` actions
- [ ] Makes POST request to `process.env.NEXTJS_REVALIDATE_URL` with Bearer auth
- [ ] Body includes `path` (e.g., `/properties/[slug]`) for path-based revalidation
- [ ] Uses `setImmediate` for non-blocking fire-and-forget
- [ ] Catches and logs errors (does not crash Strapi on webhook failure)
- [ ] `register()` function signature uncommented: `register({ strapi })`

**Verification:**
- [ ] Strapi dev server starts without errors
- [ ] Manual test: publish a property in Strapi admin → check Next.js logs for revalidation call
- [ ] TypeScript compiles: `npx tsc --noEmit` in `server/` (if applicable) or `npm run build`

**Dependencies:** Task 1 (endpoint must exist for middleware to call)

**Files likely touched:**
- `server/src/index.ts` (MODIFY — add middleware to register(), add helper function)

**Estimated scope:** Small (1 file)

---

## Task 4: Add Strapi Environment Variables

**Description:** Document and ensure the required environment variables are available in the Strapi `.env` configuration. Two new vars needed: `NEXTJS_REVALIDATE_URL` (full URL to Next.js revalidate endpoint) and `REVALIDATION_SECRET` (shared secret matching Next.js `REVALIDATE_SECRET`).

**Acceptance criteria:**
- [ ] `NEXTJS_REVALIDATE_URL` added to `server/.env.example`
- [ ] `REVALIDATION_SECRET` added to `server/.env.example` (or documented as shared with Next.js)
- [ ] Middleware uses `process.env.NEXTJS_REVALIDATE_URL` and `process.env.REVALIDATION_SECRET`
- [ ] Values match the corresponding Next.js `REVALIDATE_SECRET`

**Verification:**
- [ ] `server/.env.example` contains both new variables with example values
- [ ] Middleware reads both vars correctly (no undefined warnings in dev)

**Dependencies:** Task 3

**Files likely touched:**
- `server/.env.example` (MODIFY)
- `server/src/index.ts` (already modified in Task 3)

**Estimated scope:** XS (1 file)

---

### Checkpoint: Complete
- [ ] All tests pass: `npm test` in `nextjs-project/`
- [ ] Next.js build succeeds: `npm run build`
- [ ] Strapi dev server starts without errors
- [ ] Manual end-to-end test: publish property in Strapi → Next.js page revalidates
- [ ] **Final review with human — ready for merge**

---

## Deferred: Time-Based Revalidation (Separate Issue)

The following work is identified in the issue AC but intentionally deferred:

| Item | Current State | Reason for Deferral |
|------|--------------|---------------------|
| `DEFAULT_REVALIDATE` 0 → 3600 | All fetches use `revalidate: 0` | Was intentional fix for hero image staleness. Requires webhook reliability first. |
| Remove `revalidate: 0` overrides | `fetch-property.ts`, `fetch-about.ts`, `fetch-global.ts` all override to 0 | Same reason — need reliable webhook before enabling time-based caching |
| Update fetch tests | Tests expect `revalidate: 0` | Follows from above |

**Recommendation:** Create a follow-up issue "Enable Time-Based Revalidation" that depends on this issue being merged and verified in production for at least 1 week.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Acceptance criteria says query param secret, we use header auth | 🟡 Policy conflict | Document rationale in PR — header auth is industry best practice, avoids log exposure |
| `revalidate: 0` vs `revalidate: 3600` pre-condition not met | 🔴 AC #8 cannot be satisfied | Explicitly deferred with rationale; document dependency on webhook reliability |
| Strapi middleware fire-and-forget silent failures | 🟡 Revalidation may not trigger | Error logging in middleware; consider retry queue for production |
| `revalidateTag(tag, "seconds")` deprecated signature | 🟡 Current code uses deprecated form | Task 1 changes to `{ expire: 0 }` per Next.js 16 docs |
| `revalidatePath` with dynamic segments requires `type` param | 🟡 May fail without `'page'` type | Task 1 always passes `'page'` as second argument for property paths |

## Open Questions

1. **Strapi env var naming:** Should Strapi use `REVALIDATION_SECRET` (as shown in research) or `REVALIDATE_SECRET` (matching Next.js naming)? Recommendation: use same name in both projects for clarity.
2. **Path format for Strapi → Next.js:** Should Strapi send `/properties/[slug]` (pattern) or `/properties/actual-slug-value` (concrete)? Recommendation: concrete path for precise invalidation.
3. **Multiple property pages:** When a property is unpublished, should we also revalidate the homepage (`/`) and properties listing (`/properties`) since the featured property may change? Recommendation: include `tags: ["properties", "global"]` alongside path for comprehensive invalidation.
