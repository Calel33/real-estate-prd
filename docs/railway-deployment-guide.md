# Railway Deployment Guide

## Architecture

Two services deployed in a single Railway project:

| Service | Technology | Port | DB |
|---|---|---|---|
| Frontend | Next.js 16 (standalone) | 3000 | None |
| Backend | Strapi 5.50.0 | 1337 | PostgreSQL |
| Database | PostgreSQL 17 (Railway managed) | 5432 | — |

Both use **Dockerfile**-based deploys (Railway auto-detects them). Services communicate over Railway's private network.

---

## Deployment Order

1. **Provision PostgreSQL** in Railway
2. **Deploy Strapi** — it needs the DB to boot
3. **Deploy Next.js** — it needs Strapi to be running for the build

---

## Service 1: PostgreSQL (Railway Managed)

Add via Railway dashboard: **+ New → Database → PostgreSQL**

After creation, Railway provides reference variables:
- `DATABASE_URL` (private, encrypted)
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

These are automatically injected into any service linked to the DB.

---

## Service 2: Strapi CMS

### Mount Point

The Strapi Dockerfile builds to `/opt/app`. The app runs as the `node` user.

**Volume mount:** `/opt/app/public/uploads` — persists uploaded media across deploys.
**Dockerfile already creates:** `.tmp/` and `public/uploads/` with `node:node` ownership.

### Environment Variables

Set these on the Strapi service in Railway:

```env
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# Database — use Railway reference variables
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=true

# Secrets — generate with: openssl rand -base64 32
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=<generated>
ADMIN_JWT_SECRET=<generated>
JWT_SECRET=<generated>
TRANSFER_TOKEN_SALT=<generated>
ENCRYPTION_KEY=<generated>

# Resend email
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=info@yourdomain.com

# Revalidation webhook
REVALIDATION_SECRET=<shared-secret>
NEXTJS_REVALIDATE_URL=https://your-nextjs.railway.app/api/revalidate
```

### Health Check

The Strapi Dockerfile already has `HEALTHCHECK` targeting `/_health` (returns 204).

### Build/Start

Railway detects the Dockerfile automatically. If using Nixpacks instead:
- Build: `npm run build`
- Start: `npm run start`
- Root directory: `server/`

### After Deploy

1. Generate a public domain in **Networking → Generate Domain**
2. Visit `https://your-strapi.railway.app/admin` to create the admin user
3. Create an API token in **Settings → API Tokens** (needed by Next.js)

---

## Service 3: Next.js Frontend

### Key Requirement: `STRAPI_URL` at Build Time

The `next.config.ts` reads `STRAPI_URL` at module scope (build time), not runtime. The Dockerfile handles this via `ARG STRAPI_URL` → `ENV STRAPI_URL`, but Railway needs `STRAPI_URL` set as a **build variable** (in addition to a runtime env var).

**Important:** Deploy Strapi first, get its public URL, then deploy Next.js with that URL.

### Environment Variables

```env
NODE_ENV=production
PORT=3000

# Build variable (must be set BEFORE deploy):
STRAPI_URL=https://your-strapi.railway.app

# Runtime variables:
STRAPI_API_TOKEN=<strapi-api-token>
RESEND_API_KEY=re_your-key
RESEND_FROM_EMAIL=info@yourdomain.com
REVALIDATE_SECRET=<shared-secret-matching-strapi>
```

### Health Check

The Dockerfile has been updated with:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/api/health').then(function(r){process.exit(r.ok?0:1)}).catch(function(){process.exit(1)})"
```

Ensure `/api/health` returns a 200 response.

### Build/Start

Railway auto-detects the Dockerfile. If using Nixpacks:
- Build: `npm run build`
- Start: `npm run start`
- Root directory: `nextjs-project/`

### After Deploy

1. Generate a public domain → this is your public website
2. Verify all pages load correctly
3. Submit a test contact form

---

## Private Networking (Optional)

If both services are in the same Railway project, they can communicate over private hostnames instead of the public internet. Reference variables:

```env
# In Next.js service:
STRAPI_URL=http://strapi-service-name.railway.internal:1337
```

This avoids public network egress costs. However, `STRAPI_URL` is used at Next.js **build time** for `remotePatterns`, so the public HTTPS URL is needed for image optimization in production. Use the public URL for `STRAPI_URL` unless you configure a custom `assetPrefix` for images separately.

---

## Revalidation Setup

1. In Strapi admin → **Settings → Webhooks**
2. Create a webhook on `entry.publish` and `entry.unpublish` for the Property model
3. URL: `https://your-nextjs.railway.app/api/revalidate?secret=<REVALIDATE_SECRET>&path=/`
4. The Next.js route handler at `/api/revalidate` validates the secret and calls `revalidatePath`

---

## Migration from SQLite to PostgreSQL

If Strapi was previously running locally with SQLite, export the data before deploying:

```bash
# Local — export from SQLite
cd server
npm run strapi export -- --no-encrypt

# After deploy — import to PostgreSQL
railway run npm run strapi import -- -f export_<timestamp>.tar.gz
```

Or use the admin panel content-type builder to recreate schemas and manually add content.

---

## Sources

- [Railway: Self-host Strapi with Postgres](https://docs.railway.com/guides/strapi) — official guide
- [Railway: Deploy Next.js App with Postgres](https://docs.railway.com/guides/nextjs)
- [Railway: Using Volumes](https://docs.railway.com/guides/volumes) — persistent uploads
- [Railway: Deploy a Vibe-Coded App](https://docs.railway.com/guides/vibe-coding-deploy) — Dockerfile health checks
- [Railway: Full-Stack Next.js Guide](https://docs.railway.com/guides/fullstack-nextjs)
- [Strapi Docker deployment docs](https://docs.strapi.io/cms/installation/docker)
- [Railway Station: Strapi V5 persistent storage](https://station.railway.com/questions/how-to-persistent-storage-in-strapi-v5-ddc0a532)
