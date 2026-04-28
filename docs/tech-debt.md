# Technical Debt — Data Layer (Issue #5)

## 1. Misplaced `createSubmission` — Medium

**File:** `nextjs-project/lib/fetch-property.ts`
**Issue:** `createSubmission` lives in a file called `fetch-property.ts`. Submissions are not properties — this is a domain boundary violation.
**Fix:** Extract `createSubmission`, `CreateSubmissionInputSchema`, and `CreateSubmissionResponseSchema` into `lib/fetch-submission.ts`.

## 2. Missing `vi.unstubAllGlobals()` in test setup — Low

**File:** `nextjs-project/__tests__/data-layer/fetch.test.ts:86`
**Issue:** `beforeEach` calls `vi.restoreAllMocks()` but never `vi.unstubAllGlobals()`. The `vi.stubGlobal('fetch', ...)` stubs are overwritten per test but technically leak across tests.
**Fix:** Add `vi.unstubAllGlobals()` to `afterEach`.

## 3. Unused `StrapiCollectionResponseSchema` — Low

**File:** `nextjs-project/lib/schemas/strapi.ts:92-102`
**Issue:** Defined but not imported or used by any fetch function. The property fetch functions define their own response schemas inline.
**Fix:** Either remove or use it in the fetch functions.

## 4. `RESEND_API_KEY` placeholder value — Medium

**File:** `nextjs-project/.env.local:6`
**Issue:** Value is `re_placeholder` which will cause runtime errors when Issue #8 (Contact Form) tries to send email via Resend.
**Fix:** Replace with a real Resend API key before Issue #8 work begins.
