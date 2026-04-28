# Strapi v5 Content Types Research Compilation

## Issue Reference: GitHub #4 - Property + Submission Content Types

---

## 1. Executive Summary

This document compiles comprehensive research for implementing three new/modified Strapi v5 content types in the real estate portfolio application:

- **`property`** (Collection Type) — Real estate listings with media, metadata, and draft/publish workflow
- **`submission`** (Collection Type) — Contact form inquiries with auto-timestamping
- **`global`** (Single Type Extension) — Site settings extended with social links and contact info

The research covers complete `schema.json` definitions, API permissions configuration, media upload patterns, data seeding via bootstrap, Strapi v5-specific changes from v4, and a step-by-step implementation guide. All schemas follow the existing project patterns found in `server/src/api/` and leverage the existing `shared` component system.

**Key recommendations:**
1. Create schemas via JSON files (not admin panel) for version control reproducibility
2. Use Draft & Publish only for `property` (not `submission`)
3. Use API Token (Full Access or Custom) for submission writes from Next.js
4. Extend existing `bootstrap` in `src/index.ts` for seeding (parallel to `scripts/seed.js`)
5. Use the Document Service API (`strapi.documents()`) for all data operations (v5 standard)

---

## 2. Content Type Specifications

### 2.1 Property Collection Type

**API ID:** `property` (plural: `properties`)  
**Kind:** `collectionType`  
**Draft & Publish:** `true` (enabled — admin needs to control visibility)  

#### Schema: `server/src/api/property/content-types/property/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "properties",
  "info": {
    "singularName": "property",
    "pluralName": "properties",
    "displayName": "Property",
    "description": "Real estate property listings"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "location": {
      "type": "string",
      "maxLength": 500
    },
    "acreage": {
      "type": "float"
    },
    "propertyType": {
      "type": "enumeration",
      "enum": [
        "residential",
        "commercial",
        "land",
        "ranch",
        "estate",
        "other"
      ]
    },
    "description": {
      "type": "richtext",
      "type": "blocks"
    },
    "heroImage": {
      "type": "media",
      "multiple": false,
      "required": true,
      "allowedTypes": ["images"]
    },
    "heroVideo": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["videos"]
    },
    "gallery": {
      "type": "media",
      "multiple": true,
      "required": false,
      "allowedTypes": ["images"]
    },
    "mapImage": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images"]
    },
    "status": {
      "type": "enumeration",
      "enum": ["draft", "published"],
      "default": "draft"
    }
  }
}
```

> **NOTE on `blocks` vs `richtext`:** Strapi v5 uses the "Blocks" editor (`"type": "blocks"`) as the primary rich text format. The old `"type": "richtext"` (Markdown) is still available. For the property description, **use `"type": "blocks"`** (the modern Blocks editor). The PRD specifies "rich text" — this should be implemented as `blocks`.

#### Field-by-Field Rationale

| Field | Type | Rationale |
|-------|------|-----------|
| `title` | string, required | Property name displayed in listings, hero overlays, and SEO title |
| `slug` | uid, targetField: title | SEO-friendly URL path (e.g., `/properties/beautiful-ranch`). Auto-generated from title |
| `location` | string | Human-readable location (e.g., "Austin, TX"). Not geocoded per PRD |
| `acreage` | float | Numeric land size (e.g., 12.5 acres). Float supports partial acreage |
| `propertyType` | enumeration | Categorization for filtering. Values chosen per PRD requirements |
| `description` | blocks (richtext) | Strapi v5 Blocks editor for rich property descriptions with formatting |
| `heroImage` | media, single, required | Primary property photo used in hero sections and OG images |
| `heroVideo` | media, single, optional | Optional hero video background per PRD |
| `gallery` | media, multiple, optional | Additional property images for gallery view |
| `mapImage` | media, single, optional | Static map image per PRD (no interactive maps) |
| `status` | enumeration | Explicit draft/published field (separate from Draft & Publish system for frontend filtering) |

#### Validation Rules

| Field | Rule | Implementation |
|-------|------|----------------|
| `title` | Required, max 255 chars | Strapi schema: `"required": true, "maxLength": 255` |
| `slug` | Required, auto-generated from title | Strapi UID with `"targetField": "title"` |
| `heroImage` | Required, images only | Strapi media: `"required": true, "allowedTypes": ["images"]` |
| `acreage` | Float format | Strapi number format: `"type": "float"` |
| `propertyType` | Must match enumeration | Strapi enum validation (server-side) |
| `status` | Must match enumeration | Strapi enum validation |

#### Relations and Media Handling

The `property` type has **no explicit relations** to other content types. All media (heroImage, heroVideo, gallery, mapImage) uses Strapi's native media relation fields, which are automatically linked to the Upload plugin's file model via `"type": "media"`.

**Strapi v5 Critical Note:** Unlike v4, Strapi v5 does NOT support uploading files at entry creation. Files must be uploaded FIRST via `POST /api/upload`, then linked to the entry by assigning the returned file ID. See Section 5 for details.

#### Created Files

```
server/src/api/property/
├── content-types/
│   └── property/
│       ├── schema.json          # Schema definition (above)
│       └── lifecycles.js        # Optional: lifecycle hooks
├── controllers/
│   └── property.ts              # Core controller (auto)
├── routes/
│   └── property.ts              # Core router (auto)
└── services/
    └── property.ts              # Core service (auto)
```

---

### 2.2 Submission Collection Type

**API ID:** `submission` (plural: `submissions`)  
**Kind:** `collectionType`  
**Draft & Publish:** `false` — every submission is immediately "live"  

#### Schema: `server/src/api/submission/content-types/submission/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "submissions",
  "info": {
    "singularName": "submission",
    "pluralName": "submissions",
    "displayName": "Submission",
    "description": "Contact form inquiries from site visitors"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "maxLength": 255
    },
    "email": {
      "type": "email",
      "required": true
    },
    "message": {
      "type": "text",
      "required": true,
      "maxLength": 5000
    },
    "submittedAt": {
      "type": "datetime",
      "required": true,
      "default": "now"
    }
  }
}
```

#### Field-by-Field Rationale

| Field | Type | Rationale |
|-------|------|-----------|
| `name` | string, required | Visitor's full name for reply |
| `email` | email, required | Validated email format for contact-back |
| `message` | text, required | Free-form inquiry text. `text` (long text) not `string` (short text) to allow longer messages |
| `submittedAt` | datetime, required, default: now | Server-side timestamp of submission. Auto-set on creation |

#### Auto-Timestamp Configuration

The `submittedAt` field is set server-side. Two approaches:

**Option A: Schema Default (Recommended)**
Use the JSON schema default (`"default": "now"`) — Strapi will auto-set it on creation. However, note that JSON schemas do not support dynamic defaults; the `"default": "now"` may need to be handled via:

**Option B: Lifecycle Hook** (`lifecycles.js`)
```javascript
// server/src/api/submission/content-types/submission/lifecycles.js
module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    data.submittedAt = new Date().toISOString();
  },
};
```

**Option C: Service Override**
Create a custom service that sets `submittedAt` before delegating to the core service.

**Recommendation:** Use Option A first (`"default": "now"` in schema), then verify. If Strapi doesn't process it, implement Option B.

#### Created Files

```
server/src/api/submission/
├── content-types/
│   └── submission/
│       ├── schema.json
│       └── lifecycles.js          # For auto-timestamp if needed
├── controllers/
│   └── submission.ts
├── routes/
│   └── submission.ts
└── services/
    └── submission.ts
```

---

### 2.3 Global Single Type (Extension)

**API ID:** `global` (singular: `global`)  
**Kind:** `singleType`  
**Draft & Publish:** `false` — global settings are always live  

#### Schema: `server/src/api/global/content-types/global/schema.json` (Extended)

```json
{
  "kind": "singleType",
  "collectionName": "globals",
  "info": {
    "singularName": "global",
    "pluralName": "globals",
    "displayName": "Global",
    "description": "Define global settings"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {},
  "attributes": {
    "siteName": {
      "type": "string",
      "required": true
    },
    "favicon": {
      "type": "media",
      "multiple": false,
      "required": false,
      "allowedTypes": ["images", "files", "videos"]
    },
    "siteDescription": {
      "type": "text",
      "required": true
    },
    "defaultSeo": {
      "type": "component",
      "repeatable": false,
      "component": "shared.seo"
    },
    "footerText": {
      "type": "string",
      "required": false
    },
    "contactEmail": {
      "type": "email",
      "required": false
    },
    "contactPhone": {
      "type": "string",
      "required": false,
      "maxLength": 20
    },
    "socialLinks": {
      "type": "component",
      "repeatable": true,
      "component": "global.social-links"
    }
  }
}
```

#### Social Link Component Schema: `server/src/components/global/social-links.json`

```json
{
  "collectionName": "components_global_social_links",
  "info": {
    "displayName": "Social Links",
    "icon": "share-alt",
    "description": "Social media platform links"
  },
  "options": {},
  "attributes": {
    "platform": {
      "type": "enumeration",
      "enum": [
        "facebook",
        "twitter",
        "instagram",
        "linkedin",
        "youtube",
        "tiktok",
        "pinterest",
        "github",
        "other"
      ],
      "required": true
    },
    "url": {
      "type": "string",
      "required": true
    },
    "label": {
      "type": "string",
      "required": false
    }
  }
}
```

**Why a component instead of inline JSON?** Components provide type safety, validation, admin panel UI, and reusability. The `socialLinks` field is a **repeatable component** (array of social link entries), allowing admins to add/remove links dynamically.

#### Configuration Fields

| Field | Type | Purpose |
|-------|------|---------|
| `siteName` | string (existing) | Brand name used in headers, titles |
| `favicon` | media (existing) | Browser tab icon |
| `siteDescription` | text (existing) | Meta description fallback |
| `defaultSeo` | component (existing, `shared.seo`) | Default SEO for pages without specific SEO |
| `footerText` | string (new) | Copyright/footer text |
| `contactEmail` | email (new) | Public contact email |
| `contactPhone` | string (new) | Public contact phone |
| `socialLinks` | component, repeatable (new) | Array of {platform, url, label} |

#### Directory for Component

```
server/src/components/global/
└── social-links.json
```

---

## 3. API Permissions Configuration

### 3.1 Public Role Permissions (Read-Only)

Public users (site visitors) need read access to published content:

| Content Type | Permission | Endpoint | Notes |
|-------------|------------|----------|-------|
| `property` | `find`, `findOne` | `GET /api/properties`, `GET /api/properties/:id` | Only published entries should be returned — Strapi applies this automatically with Draft & Publish |
| `global` | `find` | `GET /api/global` | Single type, only one entry |
| `about` | `find` | `GET /api/about` | Single type, only one entry |

**Do NOT enable** `create`, `update`, or `delete` for Public role on any content type.

**Warning:** The public role can also see draft entries if explicitly queried. To prevent this:
- Use the `status` filter in frontend queries: `?filters[status][$eq]=published`
- Or rely on Strapi's Draft & Publish default behavior (non-published entries are excluded for Public role)

### 3.2 Authenticated Role Permissions

For this project's scope, the Authenticated role is not needed for content access. The Public role handles all frontend reads. If an admin panel user needs API access, use API Tokens (see below).

### 3.3 API Token Setup

**Purpose:** The Next.js contact form route handler (`/api/contact`) needs to POST submissions to Strapi.

**Token Type:** **Custom** API Token with only `submission.create` permission.

**Steps:**
1. In Strapi Admin → Settings → Global Settings → API Tokens
2. Click "Create new API Token"
3. Name: `Next.js Contact Form`
4. Description: `Used by Next.js server to create contact form submissions`
5. Token duration: `Unlimited` (or set to 90 days and rotate)
6. Token type: `Custom`
7. Enable only: `submission` → `create`
8. Save and copy the token immediately (only shown once unless encryption key is set)

**Usage in Next.js:**
```typescript
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const response = await fetch(`${STRAPI_URL}/api/submissions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  },
  body: JSON.stringify({ data: { name, email, message, submittedAt: new Date().toISOString() } }),
});
```

### 3.4 Security Considerations

| Concern | Mitigation |
|---------|------------|
| Token exposure | Store in `.env` / Vercel environment variables, never in client code |
| Token rotation | Set expiry (30/90 days) or rotate periodically |
| Rate limiting | Strapi has built-in rate limiting for auth endpoints; consider rate-limiting the submission endpoint in production |
| Input validation | Strapi validates required fields and types server-side. Also validate on the Next.js route handler with Zod (per PRD) |
| CORS | Ensure `config/middlewares.ts` includes CORS settings for the Next.js domain |
| Private fields | Mark sensitive fields as `"private": true` in schema if needed |

---

## 4. Implementation Guide

### 4.1 Option A: Via Content-Type Builder (Admin Panel)

Suitable for initial prototyping:

1. Start Strapi dev server: `npm run develop` (from `server/`)
2. Navigate to Content-Type Builder
3. Create `property` collection type with specified fields
4. Create `submission` collection type with specified fields
5. Edit `global` single type — add `footerText`, `contactEmail`, `contactPhone`
6. Create `global.social-links` component
7. Add `socialLinks` (repeatable component) to `global`
8. Save

**Caveat:** The admin panel will overwrite `schema.json` — any manual edits to the JSON will be lost when saving via admin panel. Prefer JSON editing for production.

### 4.2 Option B: Via Direct JSON Files (Recommended)

Create the following directories and files by copying the schemas from Section 2:

```bash
# From server/ directory
mkdir -p src/api/property/content-types/property
mkdir -p src/api/property/controllers
mkdir -p src/api/property/routes
mkdir -p src/api/property/services
mkdir -p src/api/submission/content-types/submission
mkdir -p src/api/submission/controllers
mkdir -p src/api/submission/routes
mkdir -p src/api/submission/services
mkdir -p src/components/global
```

Then create each file with the schemas from Section 2.

### 4.3 Option C: Via CLI (Strapi v5 Generators)

Strapi v5 supports generating content types via CLI:

```bash
# Generate property collection type
npx strapi generate content-type property title:string slug:uid location:string acreage:float propertyType:enumeration description:richtext heroImage:media heroVideo:media gallery:media mapImage:media status:enumeration

# Generate submission collection type
npx strapi generate content-type submission name:string email:email message:text submittedAt:datetime
```

Then manually edit the generated `schema.json` files to add required validations, targetField for slug, enumeration values, etc.

### 4.4 Route, Controller, and Service Files

Each content type needs standard core files. These follow the same pattern as existing content types:

```typescript
// src/api/property/routes/property.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::property.property');

// src/api/property/controllers/property.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreController('api::property.property');

// src/api/property/services/property.ts
import { factories } from '@strapi/strapi';
export default factories.createCoreService('api::property.property');
```

Same pattern for `submission`. The `global` content type already has these files — only its schema needs updating.

### 4.5 Regenerate TypeScript Types

After creating schemas, regenerate Strapi types:

```bash
npm run strapi ts:generate-types
```

This creates/updates types in `server/types/generated/` for editor autocompletion.

### 4.6 Restart and Verify

```bash
npm run develop    # Strapi picks up schema changes on restart
```

---

## 5. Media Upload Integration

### 5.1 Strapi v5 Two-Step Upload Flow

**Critical Breaking Change:** Strapi v5 removed the ability to upload files at entry creation. The flow is now:

**Step 1:** Upload the file to the media library
**Step 2:** Create the entry with the uploaded file ID(s)

### 5.2 Frontend Integration Code (Next.js)

```typescript
// --- Upload a single image (Step 1) ---
async function uploadImage(file: File): Promise<{ id: number; url: string }> {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('fileInfo', JSON.stringify({
    alternativeText: 'Property image',
    caption: file.name,
  }));

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      // Do NOT set Content-Type — browser will set multipart boundary automatically
    },
    body: formData,
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
  const [uploaded] = await response.json();
  return { id: uploaded.id, url: uploaded.url };
}

// --- Upload multiple images (Step 1) ---
async function uploadMultipleImages(files: File[]): Promise<Array<{ id: number; url: string }>> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
  return response.json(); // Returns array of { id, name, url, ... }
}

// --- Create property entry with linked media (Step 2) ---
async function createProperty(data: {
  title: string;
  slug?: string;
  location?: string;
  acreage?: number;
  propertyType?: string;
  description?: any;
  heroImageId?: number;
  heroVideoId?: number;
  galleryIds?: number[];
  mapImageId?: number;
  status?: string;
}) {
  const body: Record<string, any> = {
    title: data.title,
    slug: data.slug,
    location: data.location,
    acreage: data.acreage,
    propertyType: data.propertyType,
    description: data.description,
    status: data.status || 'draft',
  };

  // Link media by ID
  if (data.heroImageId) body.heroImage = data.heroImageId;
  if (data.heroVideoId) body.heroVideo = data.heroVideoId;
  if (data.galleryIds?.length) body.gallery = data.galleryIds;
  if (data.mapImageId) body.mapImage = data.mapImageId;

  const response = await fetch(`${STRAPI_URL}/api/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
    },
    body: JSON.stringify({ data: body }),
  });

  if (!response.ok) throw new Error(`Create failed: ${response.statusText}`);
  return response.json();
}
```

### 5.3 Admin Panel Upload (Simpler Alternative)

If media is managed exclusively through the Strapi admin panel (which is the expected workflow per the PRD), the two-step flow is handled transparently by the admin UI. The admin user:
1. Uploads images to the Media Library
2. Creates/edits a property entry
3. Selects images from the media picker (auto-linked)

The frontend integration only needs the two-step flow if programmatic uploads from Next.js are required (e.g., a custom image management page).

### 5.4 Error Handling

```typescript
async function safeUpload(file: File): Promise<{ data?: { id: number; url: string }; error?: string }> {
  try {
    const result = await uploadImage(file);
    return { data: result };
  } catch (err) {
    console.error('Upload error:', err);
    return { error: err instanceof Error ? err.message : 'Upload failed' };
  }
}
```

---

## 6. Data Seeding Strategy

### 6.1 Existing Seed Pattern

The project already has a seed script at `server/scripts/seed.js` that uses the Strapi v5 Document Service API (`strapi.documents()`). This pattern should be followed.

Key pattern from existing seed:
```javascript
// server/scripts/seed.js
async function createEntry({ model, entry }) {
  await strapi.documents(`api::${model}.${model}`).create({
    data: entry,
  });
}
```

### 6.2 Bootstrap-Based Seeding (Recommended)

Extend `server/src/index.ts` to seed data on first run:

```typescript
// server/src/index.ts
export default {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }: { strapi: any }) {
    // Only seed in development
    if (process.env.NODE_ENV !== 'development') return;
    
    // Check if already seeded
    const existingProperties = await strapi.documents('api::property.property').findMany({});
    if (existingProperties.length > 0) {
      console.log('✅ Seed data already exists, skipping...');
      return;
    }

    console.log('🌱 Seeding initial data...');
    await seedProperties(strapi);
    await seedSubmissions(strapi);
    await updateGlobal(strapi);
    console.log('✅ Seed complete!');
  },
};

async function seedProperties(strapi: any) {
  // Upload hero image first
  const heroImage = await uploadSeedImage(strapi, 'hero-property.jpg');
  
  await strapi.documents('api::property.property').create({
    data: {
      title: 'Sunset Valley Ranch',
      slug: 'sunset-valley-ranch',
      location: 'Austin, Texas',
      acreage: 12.5,
      propertyType: 'ranch',
      description: {
        type: 'paragraph',
        children: [{ type: 'text', text: 'A beautiful ranch property in the heart of Texas hill country...' }],
      },
      heroImage: heroImage.id,
      status: 'published',
      publishedAt: new Date(),
    },
  });
}

async function seedSubmissions(strapi: any) {
  // Example submission for testing
  await strapi.documents('api::submission.submission').create({
    data: {
      name: 'Test Visitor',
      email: 'test@example.com',
      message: 'This is a test submission for development purposes.',
      submittedAt: new Date().toISOString(),
    },
  });
}

async function updateGlobal(strapi: any) {
  // Update global with social links
  const global = await strapi.documents('api::global.global').findFirst({});
  if (global) {
    await strapi.documents('api::global.global').update({
      documentId: global.documentId,
      data: {
        footerText: '© 2026 Sunset Valley Properties. All rights reserved.',
        contactEmail: 'hello@sunsetvalley.com',
        contactPhone: '+1 (512) 555-0142',
        socialLinks: [
          { platform: 'instagram', url: 'https://instagram.com/sunsetvalley', label: 'Instagram' },
          { platform: 'facebook', url: 'https://facebook.com/sunsetvalley', label: 'Facebook' },
        ],
      },
    });
  }
}

async function uploadSeedImage(strapi: any, fileName: string) {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '..', 'data', 'uploads', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Seed image not found: ${filePath}`);
    return { id: null };
  }

  const file = fs.createReadStream(filePath);
  const [uploaded] = await strapi.plugin('upload').service('upload').upload({
    data: {},
    files: { filepath: file, originalFilename: fileName, mimetype: 'image/jpeg' },
  });
  
  return uploaded;
}
```

### 6.3 Standalone Script Seed (Alternative)

The existing `scripts/seed.js` pattern can be extended with property/submission seed data. This runs via:
```bash
npm run seed:example
# Or for property-specific:
node scripts/seed-properties.js
```

### 6.4 Sample Seed Data

```json
{
  "properties": [
    {
      "title": "Sunset Valley Ranch",
      "slug": "sunset-valley-ranch",
      "location": "Austin, Texas",
      "acreage": 12.5,
      "propertyType": "ranch",
      "description": "A stunning ranch property with panoramic views of the Texas hill country...",
      "status": "published"
    }
  ],
  "global": {
    "footerText": "© 2026 Real Estate Portfolio. All rights reserved.",
    "contactEmail": "hello@example.com",
    "contactPhone": "+1 (555) 123-4567",
    "socialLinks": [
      { "platform": "instagram", "url": "https://instagram.com/example", "label": "Instagram" },
      { "platform": "linkedin", "url": "https://linkedin.com/in/example", "label": "LinkedIn" }
    ]
  }
}
```

### 6.5 Migration Considerations

- **Development only:** Always gate seeding behind `NODE_ENV === 'development'`
- **Idempotency:** Check for existing data before seeding (`findMany({})` length check)
- **Environment variable:** Consider `SEED_SKIP=true` env var to force skip
- **Media files:** Seed images should be placed in `server/data/uploads/`
- **Document Service API:** Use `strapi.documents()` (v5 API) not `strapi.entityService()` (deprecated v4 API)
- **Published state:** When Draft & Publish is enabled, set `publishedAt: new Date()` to auto-publish seed data

---

## 7. Best Practices & Patterns

### 7.1 From Local Research

| Pattern | Source | Recommendation |
|---------|--------|---------------|
| Schema via JSON | `server/src/api/*/content-types/*/schema.json` | Version-controlled, reproducible. Edit JSON directly, not admin panel |
| Core factories | `server/src/api/*/controllers/*.ts`, routes, services | Use `factories.createCoreRouter/Controller/Service` with uid |
| Component system | `server/src/components/shared/` | Create `global/social-links.json` component for repeatable data |
| Seed script pattern | `server/scripts/seed.js` | Uses `strapi.documents().create()`, `strapi.plugin('upload').service('upload').upload()` |
| Config pattern | `server/config/*.ts` | TypeScript config files with `env()` helpers |
| API defaults | `server/config/api.ts` | `defaultLimit: 25`, `maxLimit: 100`, `withCount: true` |

### 7.2 From Online Research

| Best Practice | Source | Implementation |
|--------------|--------|----------------|
| Singular names for content types | [Strapi Docs](https://docs.strapi.io/cms/features/content-type-builder) | `property`, `submission`, not `properties` |
| Draft & Publish only when needed | [Strapi Docs](https://docs.strapi.io/cms/features/draft-and-publish) | Enable for `property`, disable for `submission` |
| Use UID for slugs | [Strapi Docs](https://docs.strapi.io/cms/features/content-type-builder#uid) | `slug` field with `targetField: "title"` |
| Document Service API | [Strapi v5 BC](https://docs.strapi.io/cms/migration/v4-to-v5/breaking-changes/entity-service-deprecated) | Use `strapi.documents()` not `strapi.entityService()` |
| Two-step media upload | [Strapi v5 BC](https://docs.strapi.io/cms/migration/v4-to-v5/breaking-changes/no-upload-at-entry-creation) | Upload file first, then link by ID |
| API Tokens for M2M auth | [Strapi Docs](https://docs.strapi.io/cms/features/api-tokens) | Use Custom token with minimal permissions |
| RBAC for admin roles | [Strapi Docs](https://docs.strapi.io/cms/features/rbac) | Super Admin + custom roles as needed |
| Blocks editor for rich text | [Strapi Docs](https://docs.strapi.io/cms/features/content-type-builder#rich-text-blocks) | Use `"type": "blocks"` instead of `"richtext"` |
| Bootstrap for seeding | [Strapi Docs](https://docs.strapi.io/cms/configurations/functions) | `src/index.ts` bootstrap function |

### 7.3 Industry Standards (Real Estate CMS)

| Standard | Recommendation |
|----------|---------------|
| Property ID / MLS | Not included for MVP. Add `mlsId` field in future iteration |
| Coordinates (lat/lng) | Not needed per PRD (static map images instead). Add `latitude`/`longitude` floats if interactive maps are added later |
| Price | Not specified in PRD. Add `price` (decimal) if needed |
| Bedrooms/Bathrooms | Not needed for land/ranch focus. Add integers if residential properties are added |
| Featured/Highlighted | Add boolean `featured` field for homepage hero selection |
| Categories/Tags | Use `propertyType` enumeration. Extend with relations if needed |

---

## 8. Common Pitfalls & Solutions

### 8.1 Known Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| `schema.json` overwritten by admin panel | Manual edits lost after saving in CTB | Always commit `schema.json` to git. Re-apply manual edits after admin panel changes |
| TypeScript build fails — JSON files not in dist | `TypeError: Cannot read properties of undefined (reading 'kind')` | This is a known Strapi 5 TypeScript issue. Apply patch or use `ts:generate-types` after schema changes |
| Media upload fails silently | File uploaded but not linked to entry | Ensure two-step flow: upload → get ID → assign ID in create/update |
| Public role can see drafts | Draft entries appear in API responses | Always filter by `status` or rely on Draft & Publish default protection |
| `documentId` vs `id` confusion | API returns `documentId` not numeric `id` | Use `documentId` for all Document Service API calls (v5 change) |
| Enumeration with numeric values | Server crash when GraphQL plugin installed | Always start enumeration values with alphabetical character |
| Content-Type Builder crashes on reload | `TypeError: Cannot read properties of undefined (reading 'kind')` | Copy `schema.json` files from `src/api/` to `dist/src/api/` after TypeScript compilation |
| Permissions not taking effect | API returns 403 after setting permissions | Restart Strapi server after permission changes |

### 8.2 Debug Tips

```bash
# Verify content types are registered
npx strapi content-types:list

# Check routes
npx strapi routes:list

# Generate types after schema changes
npm run strapi ts:generate-types -- --debug

# Clear cache and restart
npm run develop

# Check for database migrations (auto-run on develop)
# Strapi automatically applies schema migrations on restart
```

### 8.3 Strapi v5 Form Submission Handling

For the contact form, the recommended approach is **not** to use a third-party form builder plugin, but rather:
1. Create the `submission` collection type (as specified in Section 2.2)
2. Expose `POST /api/submissions` via API Token
3. The Next.js route handler (`/api/contact`) validates with Zod, then POSTs to Strapi

This keeps the architecture simple and avoids plugin dependencies.

---

## 9. Strapi v5 Specific Changes

### 9.1 v4 to v5 Migration Notes

| Change | v4 Behavior | v5 Behavior | Impact |
|--------|-------------|-------------|--------|
| **Entity Service** | `strapi.entityService.create()` | `strapi.documents().create()` | Seed scripts and custom services must use Document Service API |
| **Media upload** | Upload at entry creation supported | Two-step upload required | All programmatic media handling needs refactoring |
| **API response format** | `{ "id": 1, "attributes": {...} }` | `{ "id": 1, "documentId": "...", ... }` (flattened) | All frontend data fetching needs updated response parsing |
| **documentId** | Only numeric `id` | String `documentId` + numeric `id` | API calls use `documentId` for CRUD |
| **Publication state** | `publicationState` query param | `status` query param (`draft`/`published`) | Frontend API calls need updated query parameters |
| **Blocks editor** | Markdown rich text (`richtext`) | Blocks editor (`blocks`) | New richer editor format; use `blocks-react-renderer` on frontend |
| **Content API** | No default input validation | Default input validation on controllers | Less custom validation needed |
| **Lifecycle hooks** | Based on Entity Service | Based on Document Service API | Different trigger patterns |
| **TypeScript** | Optional | First-class support | Use `ts:generate-types` for type safety |
| **i18n** | Plugin | Core feature | Need to configure if multi-locale needed in future |
| **Vite** | Webpack | Vite (default in v5) | Faster builds, different config for admin customization |

### 9.2 New Features Leveraged

| Feature | How We Use It |
|---------|---------------|
| Blocks editor (`blocks`) | Rich text for property description |
| Document Service API (`strapi.documents()`) | All data operations in seed scripts |
| API Tokens with Custom scope | Minimal-permission token for submission creation |
| TypeScript schemas | `ts:generate-types` for type-safe development |

### 9.3 Breaking Changes to Avoid

1. **❌ Do NOT use `strapi.entityService()`** — use `strapi.documents()` instead
2. **❌ Do NOT upload files at entry creation** — use two-step flow (Section 5)
3. **❌ Do NOT use `publicationState` query param** — use `status` instead
4. **❌ Do NOT assume numeric `id` only** — both `id` and `documentId` exist
5. **❌ Do NOT use `findPage()`** — it doesn't exist in Document Service API

---

## 10. Testing Checklist

### 10.1 Content Type Verification

- [ ] `GET /api/properties` returns 200 with empty data array (no entries yet)
- [ ] `GET /api/properties?populate=*` returns populated media fields
- [ ] `POST /api/properties` with valid data creates entry (requires admin auth or API token)
- [ ] `POST /api/submissions` with valid data creates entry (requires API token)
- [ ] `GET /api/global?populate=*` returns extended global fields (footerText, contactEmail, contactPhone, socialLinks)
- [ ] `socialLinks` appears as an array in global response

### 10.2 Permission Verification

- [ ] Public: `GET /api/properties` returns 200
- [ ] Public: `POST /api/properties` returns 403
- [ ] Public: `POST /api/submissions` returns 403 (permission denied, must use API token)
- [ ] Public: `GET /api/submissions` returns 403 (private data)
- [ ] API Token with submission.create: `POST /api/submissions` returns 201
- [ ] API Token with submission.create: `GET /api/submissions` returns 403 (insufficient scope)
- [ ] Read-Only API Token: `POST /api/submissions` returns 403

### 10.3 Media Upload Verification

- [ ] `POST /api/upload` with multipart/form-data returns uploaded file object
- [ ] Uploaded files appear in Media Library
- [ ] Property can be created with linked heroImage ID
- [ ] Gallery can hold multiple images
- [ ] heroImage is required (entry creation without it fails validation)

### 10.4 Draft & Publish Verification

- [ ] New property entry defaults to draft status
- [ ] Draft entries are **not** returned in Public API responses
- [ ] Published entries **are** returned in Public API responses
- [ ] Unpublishing an entry removes it from Public API
- [ ] Republishing restores visibility

### 10.5 Seed Data Verification

- [ ] On fresh DB, restarting Strapi in development creates seed property
- [ ] Seed data creates submission entry
- [ ] Global settings are updated with social links
- [ ] Running seed twice does not duplicate data (idempotency check works)

### 10.6 API Endpoint Verification

| Endpoint | Method | Expected Status | Notes |
|----------|--------|----------------|-------|
| `/api/properties` | GET | 200 | Array of properties |
| `/api/properties/:documentId` | GET | 200 | Single property |
| `/api/properties?filters[status][$eq]=published` | GET | 200 | Only published |
| `/api/properties?filters[slug][$eq]=sunset-valley-ranch` | GET | 200 | By slug |
| `/api/properties?populate=heroImage,gallery,mapImage` | GET | 200 | With media |
| `/api/submissions` | POST | 201 | With valid API token |
| `/api/submissions` | GET | 403 | No public read |
| `/api/global?populate=*` | GET | 200 | Global + social |

---

## 11. References

### Documentation Sources (Local)
- **Strapi Docs:** `C:\Users\user1\Desktop\master-docs\opensrc\repos\github.com\strapi\documentation\docusaurus\docs\cms\`
  - [Content-Type Builder](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/features/content-type-builder.md)
  - [Models / Schema](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/features/content-type-builder.md)
  - [Users & Permissions](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/features/users-permissions.md)
  - [API Tokens](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/features/api-tokens.md)
  - [Draft & Publish](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/features/draft-and-publish.md)
  - [Media Library](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/features/media-library.md)
  - [RBAC](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/features/rbac.md)
  - [V4 to V5 Breaking Changes](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/migration/v4-to-v5/breaking-changes.md)
  - [Lifecycle Functions](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/configurations/functions.md)
  - [REST API Upload](file:///C:/Users/user1/Desktop/master-docs/opensrc/repos/github.com/strapi/documentation/docusaurus/docs/cms/api/rest/upload.md)

- **Project PRD:** `C:\Users\user1\Desktop\2026-projects\real-estate\PRD.md`
- **Existing Seed Script:** `C:\Users\user1\Desktop\2026-projects\real-estate\server\scripts\seed.js`
- **Existing Schemas:** `C:\Users\user1\Desktop\2026-projects\real-estate\server\src\api\*\content-types\*\schema.json`
- **Existing Components:** `C:\Users\user1\Desktop\2026-projects\real-estate\server\src\components\shared\`

### Documentation Sources (Online)
- [Strapi v5 Docs - Content-Type Builder](https://docs.strapi.io/cms/features/content-type-builder)
- [Strapi v5 Docs - Models](https://docs.strapi.io/cms/backend-customization/models)
- [Strapi v5 Docs - Users & Permissions](https://docs.strapi.io/cms/features/users-permissions)
- [Strapi v5 Docs - API Tokens](https://docs.strapi.io/cms/features/api-tokens)
- [Strapi v5 Docs - Upload API](https://docs.strapi.io/cms/api/rest/upload)
- [Strapi v5 Docs - Draft & Publish](https://docs.strapi.io/cms/features/draft-and-publish)
- [Strapi v5 Docs - Lifecycle Functions](https://docs.strapi.io/cms/configurations/functions)
- [Strapi v5 Docs - V4 to V5 Migration](https://docs.strapi.io/cms/migration/v4-to-v5/breaking-changes/no-upload-at-entry-creation)
- [Strapi - Content Modeling Best Practices](https://strapi.io/blog/content-modeling)
- [Strapi - Custom API Endpoints](https://strapi.io/blog/how-to-create-a-custom-api-endpoint-in-strapi)
- [Strapi - Image Upload with Next.js](https://dev.to/strapi/image-upload-to-strapi-via-rest-api-with-nextjs-and-postman-521o)
- [GitHub Issue #21753 - schema.json overwritten](https://github.com/strapi/strapi/issues/21753)
- [GitHub Issue #25101 - TypeScript JSON dist](https://github.com/strapi/strapi/issues/25101)
- [strapi-generate-seed-data](https://github.com/andriishupta/strapi-generate-seed-data) (seed data pattern reference)

---

## 12. Open Questions / Decisions Needed

| # | Question | Options | Decision Needed By |
|---|----------|---------|--------------------|
| 1 | **Blocks vs Markdown for description?** | `"type": "blocks"` (Blocks editor, richer) vs `"type": "richtext"` (Markdown) | **Use `blocks`** — it's the Strapi v5 standard. Frontend renderer needed (`@strapi/blocks-react-renderer`) |
| 2 | **Should `status` enum be separate from Draft & Publish?** | Option A: Only Draft & Publish (no `status` field). Option B: Both (D&P for admin + `status` for frontend filtering) | **Option B recommended** — `status` field enables frontend-side filtering without relying solely on publish state |
| 3 | **Rate limiting for submission endpoint?** | Enable Strapi's koa-ratelimit or handle at Cloudflare/Vercel level | Consider adding if bot submissions become an issue |
| 4 | **Email notification on submission?** | Via Resend (as specified in PRD) or Strapi's email plugin | Already decided: Resend via Next.js route handler, not Strapi |
| 5 | **API Token duration?** | Unlimited vs 90-day rotation | **Start with Unlimited** for development. Set 90-day rotation for production |
| 6 | **Position of `socialLinks` component category?** | `global` category (under components/global/) vs `shared` category (under components/shared/) | **Use `global`** — it's specific to the global settings, not broadly shared |
| 7 | **Seed data location?** | Via `src/index.ts` bootstrap vs standalone `scripts/seed.js` | **Both** — bootstrap for dev auto-seed, standalone script for manual re-seed |
| 8 | **Should `submittedAt` use lifecycle hook or schema default?** | Schema default (`"default": "now"`) vs lifecycle hook | **Test schema default first** — if Strapi doesn't process it, add lifecycle hook |
| 9 | **Additional property fields for MVP?** | Current fields per PRD. Add `price`, `bedrooms`, `bathrooms`, `featured`? | Keep MVP lean. Add only what's in PRD |
| 10 | **CORS configuration for Next.js frontend?** | Update `config/middlewares.ts` to allow Next.js origin | **Required** — add CORS entry for `http://localhost:3000` (dev) and production domain |

---

## Appendix A: Files to Create/Modify Summary

| Action | File Path | Change |
|--------|-----------|--------|
| CREATE | `server/src/api/property/content-types/property/schema.json` | Property schema definition |
| CREATE | `server/src/api/property/content-types/property/lifecycles.js` | Optional lifecycle hooks |
| CREATE | `server/src/api/property/controllers/property.ts` | Core controller |
| CREATE | `server/src/api/property/routes/property.ts` | Core router |
| CREATE | `server/src/api/property/services/property.ts` | Core service |
| CREATE | `server/src/api/submission/content-types/submission/schema.json` | Submission schema |
| CREATE | `server/src/api/submission/content-types/submission/lifecycles.js` | Auto-timestamp lifecycle (if needed) |
| CREATE | `server/src/api/submission/controllers/submission.ts` | Core controller |
| CREATE | `server/src/api/submission/routes/submission.ts` | Core router |
| CREATE | `server/src/api/submission/services/submission.ts` | Core service |
| CREATE | `server/src/components/global/social-links.json` | Social link component |
| MODIFY | `server/src/api/global/content-types/global/schema.json` | Add footerText, contactEmail, contactPhone, socialLinks |
| MODIFY | `server/src/index.ts` | Add bootstrap seed logic |

## Appendix B: API Response Shape Examples

### GET /api/properties?populate=heroImage (single property)
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123def",
      "title": "Sunset Valley Ranch",
      "slug": "sunset-valley-ranch",
      "location": "Austin, Texas",
      "acreage": 12.5,
      "propertyType": "ranch",
      "status": "published",
      "heroImage": {
        "id": 1,
        "documentId": "img456",
        "url": "/uploads/sunset_hero_123.jpg",
        "alternativeText": "Sunset Valley Ranch hero image",
        "width": 1920,
        "height": 1080,
        "formats": {
          "large": { "url": "/uploads/large_sunset_hero_123.jpg" },
          "medium": { "url": "/uploads/medium_sunset_hero_123.jpg" },
          "small": { "url": "/uploads/small_sunset_hero_123.jpg" }
        }
      },
      "createdAt": "2026-04-27T12:00:00.000Z",
      "updatedAt": "2026-04-27T12:00:00.000Z",
      "publishedAt": "2026-04-27T12:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

### POST /api/submissions (create submission)
```json
// Request body
{
  "data": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "I'm interested in the Sunset Valley Ranch property. Please send more details."
  }
}

// Response (201 Created)
{
  "data": {
    "id": 1,
    "documentId": "sub001",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "I'm interested in the Sunset Valley Ranch property. Please send more details.",
    "submittedAt": "2026-04-27T12:30:00.000Z",
    "createdAt": "2026-04-27T12:30:00.000Z",
    "updatedAt": "2026-04-27T12:30:00.000Z"
  }
}
```

### GET /api/global?populate[socialLinks]=true
```json
{
  "data": {
    "id": 1,
    "documentId": "global01",
    "siteName": "Sunset Valley Properties",
    "siteDescription": "Premium real estate portfolio",
    "footerText": "© 2026 Sunset Valley Properties. All rights reserved.",
    "contactEmail": "hello@sunsetvalley.com",
    "contactPhone": "+1 (512) 555-0142",
    "socialLinks": [
      {
        "id": 1,
        "platform": "instagram",
        "url": "https://instagram.com/sunsetvalley",
        "label": "Instagram"
      },
      {
        "id": 2,
        "platform": "facebook",
        "url": "https://facebook.com/sunsetvalley",
        "label": "Facebook"
      }
    ]
  },
  "meta": {}
}
```

---

*Research compiled: April 27, 2026*  
*For: GitHub Issue #4 — Property + Submission Content Types*  
*Project: Real Estate Portfolio Application*
